(function () {
  "use strict";

  var MAX_SENTENCES = 300; // safety cap so the O(n^2) similarity matrix stays fast

  // ---------- Sentence splitting ----------

  function splitSentences(rawText) {
    var normalized = rawText.replace(/\r\n/g, "\n").replace(/ /g, " ");

    // Split after sentence-ending punctuation (Korean/English/Japanese-style) followed
    // by whitespace, or on any run of newlines (paragraph/line breaks act as boundaries
    // too, since many documents don't end every line with punctuation).
    var rough = normalized.split(/(?<=[.!?。!?])\s+|\n+/);

    var sentences = [];
    for (var i = 0; i < rough.length; i++) {
      var s = rough[i].replace(/\s+/g, " ").trim();
      // Drop very short fragments (page numbers, bullet markers, stray headers) -
      // they add noise rather than signal for TextRank's similarity graph.
      if (s.length >= 8) {
        sentences.push(s);
      }
    }
    return sentences.slice(0, MAX_SENTENCES);
  }

  // ---------- Tokenization / similarity ----------

  function tokenize(sentence) {
    var cleaned = sentence.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, " ");
    var parts = cleaned.split(/\s+/);
    var tokens = [];
    for (var i = 0; i < parts.length; i++) {
      if (parts[i]) tokens.push(parts[i]);
    }
    return tokens;
  }

  function toFreqMap(tokens) {
    var freq = Object.create(null);
    for (var i = 0; i < tokens.length; i++) {
      var t = tokens[i];
      freq[t] = (freq[t] || 0) + 1;
    }
    return freq;
  }

  function cosineSimilarity(freqA, freqB) {
    var dot = 0;
    var normA = 0;
    var normB = 0;
    var key;
    for (key in freqA) {
      normA += freqA[key] * freqA[key];
      if (freqB[key]) dot += freqA[key] * freqB[key];
    }
    for (key in freqB) {
      normB += freqB[key] * freqB[key];
    }
    if (normA === 0 || normB === 0) return 0;
    return dot / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  // ---------- PageRank over the sentence similarity graph ----------

  function pageRank(sim, damping, iterations) {
    var n = sim.length;
    if (n === 0) return [];
    var scores = new Array(n).fill(1 / n);
    var outSums = new Array(n);
    var i, j;
    for (i = 0; i < n; i++) {
      var sum = 0;
      for (j = 0; j < n; j++) {
        sum += sim[i][j];
      }
      outSums[i] = sum;
    }

    for (var iter = 0; iter < iterations; iter++) {
      var newScores = new Array(n);
      for (i = 0; i < n; i++) {
        var acc = 0;
        for (j = 0; j < n; j++) {
          if (j === i) continue;
          if (outSums[j] > 0) {
            acc += (sim[j][i] / outSums[j]) * scores[j];
          }
        }
        newScores[i] = (1 - damping) / n + damping * acc;
      }
      scores = newScores;
    }
    return scores;
  }

  // ---------- Public API ----------

  function scoreSentences(sentences) {
    var n = sentences.length;
    if (n === 0) return [];
    if (n === 1) return [1];

    var freqs = new Array(n);
    for (var i = 0; i < n; i++) {
      freqs[i] = toFreqMap(tokenize(sentences[i]));
    }

    var sim = new Array(n);
    for (i = 0; i < n; i++) {
      sim[i] = new Array(n).fill(0);
    }
    for (i = 0; i < n; i++) {
      for (var j = i + 1; j < n; j++) {
        var s = cosineSimilarity(freqs[i], freqs[j]);
        sim[i][j] = s;
        sim[j][i] = s;
      }
    }

    return pageRank(sim, 0.85, 40);
  }

  function selectSummary(sentences, scores, k) {
    var n = sentences.length;
    k = Math.max(1, Math.min(k, n));

    var ranked = [];
    for (var i = 0; i < n; i++) {
      ranked.push({ index: i, score: scores[i] });
    }
    ranked.sort(function (a, b) {
      return b.score - a.score;
    });

    var topIndices = ranked.slice(0, k).map(function (r) {
      return r.index;
    });
    topIndices.sort(function (a, b) {
      return a - b;
    });

    var summarySentences = topIndices.map(function (i) {
      return sentences[i];
    });

    return {
      indices: topIndices,
      text: summarySentences.join(" ")
    };
  }

  window.TextRank = {
    splitSentences: splitSentences,
    scoreSentences: scoreSentences,
    selectSummary: selectSummary,
    MAX_SENTENCES: MAX_SENTENCES
  };
})();

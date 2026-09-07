/**
 * ==========================================================================
 * K-TRIP NAVI - Main Application Script
 * 10년차 전문 웹 퍼블리셔 기준 모듈화 스크립트
 * 
 * 기술 스택: jQuery 3.7+ / Vanilla JS (Web Speech API)
 * 모듈 구성:
 *   1. Navigation Module (모바일 드로어, 스크롤스파이, 스무스 스크롤)
 *   2. Checklist Module (로컬스토리지 연동, 진행률 바)
 *   3. Spots Tab Module (4개 지역 탭 UI 및 키보드 웹 접근성)
 *   4. Speech TTS Module (Web Speech API 기반 한국어 ko-KR 발음 재생)
 *   5. Phrase Modal Module (원터치 회화 확대 모달, 포커스 트랩, ESC 닫기)
 *   6. Emergency FAB Module (플로팅 긴급 메뉴 토글)
 * ==========================================================================
 */

(function ($) {
  'use strict';

  // --------------------------------------------------------------------------
  // 1. 네비게이션 모듈 (Navigation Module)
  // --------------------------------------------------------------------------
  const NavModule = {
    init: function () {
      this.$header = $('#mainHeader');
      this.$navLinks = $('.nav-link');
      this.$drawer = $('#mobileDrawer');
      this.$drawerToggle = $('#drawerToggle');
      this.$drawerClose = $('#drawerClose');
      this.$sections = $('section[id]');

      this.bindEvents();
      this.initScrollSpy();
    },

    bindEvents: function () {
      const self = this;

      // 모바일 드로어 열기
      this.$drawerToggle.on('click', function () {
        self.openDrawer();
      });

      // 모바일 드로어 닫기
      this.$drawerClose.on('click', function () {
        self.closeDrawer();
      });

      // 모바일 드로어 내부 링크 클릭 시 자동 닫힘
      this.$drawer.find('a').on('click', function () {
        self.closeDrawer();
      });

      // 윈도우 스크롤 시 스크롤스파이 및 헤더 섀도우 처리
      $(window).on('scroll', function () {
        self.handleScroll();
      });

      // ESC 키 입력 시 드로어 닫기
      $(document).on('keydown', function (e) {
        if (e.key === 'Escape' && !self.$drawer.hasClass('hidden')) {
          self.closeDrawer();
        }
      });
    },

    openDrawer: function () {
      this.$drawer.removeClass('hidden');
      $('body').addClass('overflow-hidden');
      this.$drawerToggle.attr('aria-expanded', 'true');
      this.$drawerClose.focus();
    },

    closeDrawer: function () {
      this.$drawer.addClass('hidden');
      $('body').removeClass('overflow-hidden');
      this.$drawerToggle.attr('aria-expanded', 'false');
      this.$drawerToggle.focus();
    },

    handleScroll: function () {
      const scrollTop = $(window).scrollTop();

      // 헤더 보더 및 섀도우 제어
      if (scrollTop > 20) {
        this.$header.addClass('shadow-md');
      } else {
        this.$header.removeClass('shadow-md');
      }

      this.initScrollSpy();
    },

    initScrollSpy: function () {
      const scrollPos = $(window).scrollTop() + 100;
      let currentSectionId = '';

      this.$sections.each(function () {
        const top = $(this).offset().top;
        const height = $(this).outerHeight();
        const id = $(this).attr('id');

        if (scrollPos >= top && scrollPos < top + height) {
          currentSectionId = id;
        }
      });

      if (currentSectionId) {
        this.$navLinks.removeClass('active');
        $(`.nav-link[href="#${currentSectionId}"]`).addClass('active');
      }
    }
  };

  // --------------------------------------------------------------------------
  // 2. 체크리스트 모듈 (Checklist Module with localStorage)
  // --------------------------------------------------------------------------
  const ChecklistModule = {
    STORAGE_KEY: 'ktrip_checklist_data_v1',

    init: function () {
      this.$checkboxes = $('.checklist-item-input');
      this.$progressPercent = $('#progressPercent');
      this.$progressBar = $('#progressBar');
      this.$completedCount = $('#completedCount');
      this.$totalCount = $('#totalCount');
      this.$resetBtn = $('#resetChecklistBtn');

      this.total = this.$checkboxes.length;
      this.$totalCount.text(this.total);

      this.bindEvents();
      this.loadState();
      this.updateProgress();
    },

    bindEvents: function () {
      const self = this;

      this.$checkboxes.on('change', function () {
        self.saveState();
        self.updateProgress();
      });

      this.$resetBtn.on('click', function () {
        if (window.confirm('チェックリストの進捗をリセットしますか？ (체크리스트를 초기화하시겠습니까?)')) {
          self.resetState();
        }
      });
    },

    updateProgress: function () {
      const checked = this.$checkboxes.filter(':checked').length;
      const percentage = this.total > 0 ? Math.round((checked / this.total) * 100) : 0;

      this.$completedCount.text(checked);
      this.$progressPercent.text(percentage + '%');
      this.$progressBar.css('width', percentage + '%');

      // 진행률에 따른 게이지 색상 피드백
      if (percentage === 100) {
        this.$progressBar.removeClass('bg-blue-600 bg-amber-500').addClass('bg-emerald-600');
      } else if (percentage >= 50) {
        this.$progressBar.removeClass('bg-emerald-600 bg-amber-500').addClass('bg-blue-600');
      } else {
        this.$progressBar.removeClass('bg-emerald-600 bg-blue-600').addClass('bg-amber-500');
      }
    },

    saveState: function () {
      const state = {};
      this.$checkboxes.each(function () {
        const id = $(this).attr('id');
        state[id] = $(this).is(':checked');
      });
      try {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(state));
      } catch (e) {
        console.warn('localStorage access failed:', e);
      }
    },

    loadState: function () {
      try {
        const data = localStorage.getItem(this.STORAGE_KEY);
        if (data) {
          const state = JSON.parse(data);
          this.$checkboxes.each(function () {
            const id = $(this).attr('id');
            if (state[id] === true) {
              $(this).prop('checked', true);
            }
          });
        }
      } catch (e) {
        console.warn('Failed to parse checklist localStorage data:', e);
      }
    },

    resetState: function () {
      this.$checkboxes.prop('checked', false);
      try {
        localStorage.removeItem(this.STORAGE_KEY);
      } catch (e) {
        console.warn('localStorage clear failed:', e);
      }
      this.updateProgress();
    }
  };

  // --------------------------------------------------------------------------
  // 3. 지역 탭 모듈 (Spots Tab Module)
  // --------------------------------------------------------------------------
  const SpotsTabModule = {
    init: function () {
      this.$tabBtns = $('.tab-btn');
      this.$tabPanels = $('.tab-panel');

      this.bindEvents();
    },

    bindEvents: function () {
      const self = this;

      this.$tabBtns.on('click', function () {
        const targetTab = $(this).data('tab');
        self.switchTab(targetTab, $(this));
      });

      // 키보드 좌우 화살표 탭 전환 접근성 지원
      this.$tabBtns.on('keydown', function (e) {
        const index = self.$tabBtns.index(this);
        let nextIndex = null;

        if (e.key === 'ArrowRight') {
          nextIndex = (index + 1) % self.$tabBtns.length;
        } else if (e.key === 'ArrowLeft') {
          nextIndex = (index - 1 + self.$tabBtns.length) % self.$tabBtns.length;
        }

        if (nextIndex !== null) {
          e.preventDefault();
          const $targetBtn = self.$tabBtns.eq(nextIndex);
          $targetBtn.focus();
          self.switchTab($targetBtn.data('tab'), $targetBtn);
        }
      });
    },

    switchTab: function (tabId, $activeBtn) {
      // 탭 버튼 상태 업데이트
      this.$tabBtns.removeClass('active').attr('aria-selected', 'false');
      $activeBtn.addClass('active').attr('aria-selected', 'true');

      // 탭 패널 표시/숨김
      this.$tabPanels.addClass('hidden').attr('hidden', true);
      const $targetPanel = $(`#tab-${tabId}`);
      $targetPanel.removeClass('hidden').removeAttr('hidden');
    }
  };

  // --------------------------------------------------------------------------
  // 4. Web Speech API 발음 재생 모듈 (Speech TTS Module)
  // --------------------------------------------------------------------------
  const SpeechModule = {
    isSupported: false,
    koreanVoice: null,

    init: function () {
      if ('speechSynthesis' in window) {
        this.isSupported = true;
        this.loadVoices();

        if (speechSynthesis.onvoiceschanged !== undefined) {
          speechSynthesis.onvoiceschanged = this.loadVoices.bind(this);
        }
      } else {
        console.warn('Web Speech API is not supported in this browser.');
      }
    },

    loadVoices: function () {
      if (!this.isSupported) return;
      const voices = window.speechSynthesis.getVoices();
      // 한국어 음성(ko-KR) 탐색
      this.koreanVoice = voices.find(function (voice) {
        return voice.lang === 'ko-KR' || voice.lang === 'ko_KR';
      }) || null;
    },

    speak: function (text) {
      if (!this.isSupported) {
        alert('お使いのブラウザは音声再生に対応していません。 (브라우저가 음성 재생을 지원하지 않습니다.)');
        return;
      }

      window.speechSynthesis.cancel(); // 이전 재생 음성 중지

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ko-KR';
      utterance.rate = 0.9; // 외국인 학습자 및 전달용 적정 속도
      utterance.pitch = 1.0;

      if (this.koreanVoice) {
        utterance.voice = this.koreanVoice;
      }

      window.speechSynthesis.speak(utterance);
    }
  };

  // --------------------------------------------------------------------------
  // 5. 회화 확대 모달 모듈 (Phrase Modal Module with Focus Trap)
  // --------------------------------------------------------------------------
  const PhraseModalModule = {
    lastFocusedElement: null,

    init: function () {
      this.$modal = $('#phraseModal');
      this.$closeBtn = $('#modalCloseBtn');
      this.$modalOverlay = $('#modalOverlay');
      this.$cards = $('.phrase-card');

      // 모달 내부 텍스트 엘리먼트
      this.$koreanText = $('#modalKoreanText');
      this.$katakanaText = $('#modalKatakanaText');
      this.$japaneseText = $('#modalJapaneseText');
      this.$situationBadge = $('#modalSituationBadge');
      this.$ttsBtn = $('#modalTtsBtn');

      this.currentKorean = '';

      this.bindEvents();
    },

    bindEvents: function () {
      const self = this;

      // 카드 클릭 시 모달 오픈 (단, 개별 TTS 버튼 클릭 제외)
      this.$cards.on('click', function (e) {
        if ($(e.target).closest('.tts-btn').length > 0) {
          return;
        }
        self.openModal($(this));
      });

      // 카드 내부 개별 TTS 재생 버튼
      $('.tts-btn').on('click', function (e) {
        e.stopPropagation();
        const text = $(this).data('speak');
        if (text) {
          SpeechModule.speak(text);
        }
      });

      // 모달 닫기 버튼
      this.$closeBtn.on('click', function () {
        self.closeModal();
      });

      // 오버레이 클릭 시 닫기
      this.$modalOverlay.on('click', function () {
        self.closeModal();
      });

      // 모달 내 발음 듣기 버튼
      this.$ttsBtn.on('click', function () {
        if (self.currentKorean) {
          SpeechModule.speak(self.currentKorean);
        }
      });

      // 키보드 접근성 (ESC 닫기 및 포커스 트랩)
      $(document).on('keydown', function (e) {
        if (self.$modal.hasClass('hidden')) return;

        if (e.key === 'Escape') {
          self.closeModal();
        } else if (e.key === 'Tab') {
          self.handleFocusTrap(e);
        }
      });
    },

    openModal: function ($card) {
      this.lastFocusedElement = document.activeElement;

      const korean = $card.data('korean') || '';
      const katakana = $card.data('katakana') || '';
      const japanese = $card.data('japanese') || '';
      const situation = $card.data('situation') || '場面';

      this.currentKorean = korean;

      this.$koreanText.text(korean);
      this.$katakanaText.text(katakana);
      this.$japaneseText.text(japanese);
      this.$situationBadge.text(situation);

      this.$modal.removeClass('hidden');
      $('body').addClass('overflow-hidden');

      this.$closeBtn.focus();
    },

    closeModal: function () {
      this.$modal.addClass('hidden');
      $('body').removeClass('overflow-hidden');

      if (this.lastFocusedElement) {
        this.lastFocusedElement.focus();
      }
    },

    handleFocusTrap: function (e) {
      const focusableSelectors = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
      const $focusables = this.$modal.find(focusableSelectors).filter(':visible');

      if ($focusables.length === 0) return;

      const $firstFocusable = $focusables.first();
      const $lastFocusable = $focusables.last();

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === $firstFocusable[0]) {
          e.preventDefault();
          $lastFocusable.focus();
        }
      } else {
        // Tab
        if (document.activeElement === $lastFocusable[0]) {
          e.preventDefault();
          $firstFocusable.focus();
        }
      }
    }
  };

  // --------------------------------------------------------------------------
  // 6. 긴급 지원 플로팅 버튼 모듈 (Emergency FAB Module)
  // --------------------------------------------------------------------------
  const FabModule = {
    init: function () {
      this.$fabMainBtn = $('#fabMainBtn');
      this.$fabMenu = $('#fabMenu');
      this.$fabCloseBtn = $('#fabCloseBtn');

      this.bindEvents();
    },

    bindEvents: function () {
      const self = this;

      this.$fabMainBtn.on('click', function (e) {
        e.stopPropagation();
        self.toggleMenu();
      });

      if (this.$fabCloseBtn.length > 0) {
        this.$fabCloseBtn.on('click', function () {
          self.closeMenu();
        });
      }

      // 외부 클릭 시 메뉴 닫기
      $(document).on('click', function (e) {
        if (!$(e.target).closest('#fabContainer').length) {
          self.closeMenu();
        }
      });

      // ESC 누를 시 닫기
      $(document).on('keydown', function (e) {
        if (e.key === 'Escape' && !self.$fabMenu.hasClass('hidden')) {
          self.closeMenu();
        }
      });
    },

    toggleMenu: function () {
      const isHidden = this.$fabMenu.hasClass('hidden');
      if (isHidden) {
        this.$fabMenu.removeClass('hidden');
        this.$fabMainBtn.attr('aria-expanded', 'true');
      } else {
        this.$fabMenu.addClass('hidden');
        this.$fabMainBtn.attr('aria-expanded', 'false');
      }
    },

    closeMenu: function () {
      this.$fabMenu.addClass('hidden');
      this.$fabMainBtn.attr('aria-expanded', 'false');
    }
  };

  // --------------------------------------------------------------------------
  // 문서 로드 완료 시 모듈 초기화 실행
  // --------------------------------------------------------------------------
  $(document).ready(function () {
    NavModule.init();
    ChecklistModule.init();
    SpotsTabModule.init();
    SpeechModule.init();
    PhraseModalModule.init();
    FabModule.init();
  });

})(jQuery);

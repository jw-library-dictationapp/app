/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
/* tslint:disable */

import {GoogleGenAI, Type} from '@google/genai';
import {marked} from 'marked';

const MODEL_NAME = 'gemini-2.5-flash';

type Language = 'en' | 'lt' | 'ru';

const UI_STRINGS = {
  polishedTab: {en: 'Polished', lt: 'Nugludinta', ru: 'Обработанная'},
  rawTab: {en: 'Raw', lt: 'Neapdorota', ru: 'Черновик'},
  untitledNote: {en: 'Untitled Note', lt: 'Užrašas be pavadinimo', ru: 'Заметка без названия'},
  polishedPlaceholder: {en: 'Your polished notes will appear here...', lt: 'Čia atsiras jūsų nugludinti užrašai...', ru: 'Здесь появятся ваши обработанные заметки...'},
  rawPlaceholder: {en: 'Raw transcription will appear here...', lt: 'Čia atsiras neapdorota transkripcija...', ru: 'Здесь появится черновая транскрипция...'},
  readyToRecord: {en: 'Ready to record', lt: 'Pasiruošta įrašyti', ru: 'Готово к записи'},
  requestingMic: {en: 'Requesting microphone access...', lt: 'Prašoma prieigos prie mikrofono...', ru: 'Запрос доступа к микрофону...'},
  micDenied: {en: 'Microphone permission denied. Please check browser settings and reload page.', lt: 'Prieiga prie mikrofono atmesta. Patikrinkite naršyklės nustatymus ir perkraukite puslapį.', ru: 'Доступ к микрофону запрещен. Проверьте настройки браузера и перезагрузите страницу.'},
  micNotFound: {en: 'No microphone found. Please connect a microphone.', lt: 'Mikrofonas nerastas. Prijunkite mikrofoną.', ru: 'Микрофон не найден. Подключите микрофон.'},
  micInUse: {en: 'Cannot access microphone. It may be in use by another application.', lt: 'Nepavyksta pasiekti mikrofono. Gali būti, kad jį naudoja kita programa.', ru: 'Не удается получить доступ к микрофону. Возможно, он используется другим приложением.'},
  errorRecording: (msg: string) => ({en: `Error: ${msg}`, lt: `Klaida: ${msg}`, ru: `Ошибка: ${msg}`}),
  processingAudio: {en: 'Processing audio...', lt: 'Apdorojamas garsas...', ru: 'Обработка аудио...'},
  noAudioData: {en: 'No audio data captured. Please try again.', lt: 'Garso duomenų neužfiksuota. Bandykite dar kartą.', ru: 'Нет аудиоданных. Попробуйте еще раз.'},
  convertingAudio: {en: 'Converting audio...', lt: 'Konvertuojamas garsas...', ru: 'Преобразование аудио...'},
  errorProcessing: {en: 'Error processing recording. Please try again.', lt: 'Klaida apdorojant įrašą. Bandykite dar kartą.', ru: 'Ошибка обработки записи. Попробуйте еще раз.'},
  gettingTranscription: {en: 'Getting transcription...', lt: 'Gaunama transkripcija...', ru: 'Получение транскрипции...'},
  transcriptionComplete: {en: 'Transcription complete. Polishing note...', lt: 'Transkripcija baigta. Gludinamas užrašas...', ru: 'Транскрипция завершена. Обработка заметки...'},
  transcriptionFailed: {en: 'Transcription failed or returned empty.', lt: 'Transkripcija nepavyko arba tuščia.', ru: 'Ошибка транскрипции или пустой результат.'},
  couldNotTranscribe: {en: 'Could not transcribe audio. Please try again.', lt: 'Nepavyko transkribuoti garso. Bandykite dar kartą.', ru: 'Не удалось транскрибировать аудио. Попробуйте еще раз.'},
  errorDuringTranscription: (msg: string) => ({en: `Error during transcription: ${msg}`, lt: `Klaida transkribuojant: ${msg}`, ru: `Ошибка во время транскрипции: ${msg}`}),
  noTranscriptionToPolish: {en: 'No transcription to polish', lt: 'Nėra transkripcijos, kurią būtų galima nugludinti', ru: 'Нет транскрипции для обработки'},
  noTranscriptionAvailable: {en: 'No transcription available to polish.', lt: 'Nėra transkripcijos, kurią būtų galima nugludinti.', ru: 'Нет доступной транскрипции для обработки.'},
  polishingNote: {en: 'Polishing note...', lt: 'Gludinamas užrašas...', ru: 'Обработка заметки...'},
  notePolished: {en: 'Note polished. Ready for next recording.', lt: 'Užrašas nugludintas. Pasiruošta kitam įrašui.', ru: 'Заметка обработана. Готово к следующей записи.'},
  polishingFailed: {en: 'Polishing failed or returned empty.', lt: 'Gludinimas nepavyko arba tuščias.', ru: 'Ошибка обработки или пустой результат.'},
  polishingReturnedEmpty: {en: 'Polishing returned empty. Raw transcription is available.', lt: 'Gludinimas grąžino tuščią rezultatą. Prieinama neapdorota transkripcija.', ru: 'Обработка вернула пустой результат. Доступна черновая транскрипция.'},
  errorDuringPolishing: (msg: string) => ({en: `Error during polishing: ${msg}`, lt: `Klaida gludinant: ${msg}`, ru: `Ошибка при обработке: ${msg}`}),
  toggleTheme: {en: 'Toggle Theme', lt: 'Keisti temą', ru: 'Переключить тему'},
  startRecording: {en: 'Start Recording', lt: 'Pradėti įrašymą', ru: 'Начать запись'},
  stopRecording: {en: 'Stop Recording', lt: 'Stabdyti įrašymą', ru: 'Остановить запись'},
  newNote: {en: 'New Note / Clear', lt: 'Naujas užrašas / Išvalyti', ru: 'Новая заметка / Очистить'},
  recordText: {en: 'Record', lt: 'Įrašyti', ru: 'Запись'},
  toggleLanguage: {en: 'Change Language', lt: 'Keisti kalbą', ru: 'Изменить язык'},
  transcriptionPrompt: {en: 'Generate a complete, detailed transcript of this audio. Identify each speaker and label their dialogue accordingly (e.g., Speaker 1:, Speaker 2:).', lt: 'Sukurkite išsamią šio garso įrašo transkripciją. Nustatykite kiekvieną kalbėtoją ir atitinkamai pažymėkite jų dialogą (pvz., Kalbėtojas:).', ru: 'Создайте полную и подробную транскрипцию этой аудиозаписи. Определите каждого говорящего и соответствующим образом пометьте их диалоги (например, Говорящий 1:, Говорящий 2:).'},
  polishSystemInstruction: {en: `You are an expert note-taking assistant. Your task is to refine raw, spoken-word transcripts into clean, well-structured, and easily readable notes. The transcript may contain labels for different speakers (e.g., "Speaker 1:", "Speaker 2:"). It is crucial that you preserve these speaker labels. For each speaker's dialogue, you must correct transcription errors, remove filler words (like "um", "uh", "you know"), fix grammar, and format the text logically using Markdown (headings, bullet points, bolding). Preserve all the original meaning and every piece of key information. Do not summarize unless explicitly asked. The final output should be only the polished note content with speaker labels intact.`, lt: `Jūs esate ekspertas užrašų darymo asistentas. Jūsų užduotis - patobulinti neapdorotas, ištartas transkripcijas į švarius, gerai struktūrizuotus ir lengvai skaitomus užrašus. Transkripcijoje gali būti skirtingų kalbėtojų etiketės (pvz., „Kalbėtojas:“). Labai svarbu, kad išsaugotumėte šias kalbėtojų etiketes. Kiekvieno kalbėtojo dialogui privalote ištaisyti transkripcijos klaidas, pašalinti užpildo žodžius (pvz., "hm", "eee", "žinai"), pataisyti gramatiką ir logiškai suformatuoti tekstą naudojant Markdown (antraštės, ženkleliai, paryškinimas). Išsaugokite visą pradinę prasmę ir kiekvieną pagrindinės informacijos dalį. Negalima apibendrinti, nebent tai būtų aiškiai paprašyta. Galutinis rezultatas turėtų būti tik patobulinto užrašo turinys su nepažeistomis kalbėtojų etiketėmis.`, ru: `Вы — эксперт-помощник по ведению заметок. Ваша задача — преобразовывать необработанные устные транскрипции в чистые, хорошо структурированные и легко читаемые заметки. Транскрипция может содержать метки для разных говорящих (например, «Говорящий 1:», «Говорящий 2:»). Крайне важно, чтобы вы сохранили эти метки говорящих. Для диалога каждого говорящего вы должны исправлять ошибки транскрипции, удалять слова-паразиты (например, «эм», «э-э», «ну»), исправлять грамматику и логически форматировать текст с использованием Markdown (заголовки, списки, выделение жирным). Сохраняйте весь первоначальный смысл и каждую ключевую деталь информации. Не делайте краткое изложение, если об этом не просят явно. Итоговый вывод должен содержать только отформатированный текст заметки с сохраненными метками говорящих.`},
  summarizePrompt: {en: 'Summarize this note concisely into the most important key points or action items. Use markdown lists.', lt: 'Trumpai apibendrinkite šį užrašą, išskirdami svarbiausius punktus ar veiksmų elementus. Naudokite markdown sąrašus.', ru: 'Кратко изложите эту заметку, выделив наиболее важные ключевые моменты или пункты действий. Используйте markdown-списки.'},
  summarize: {en: 'Summarize', lt: 'Sutraukti', ru: 'Суммировать'},
  regenerate: {en: 'Regenerate', lt: 'Atkurti iš naujo', ru: 'Регенерировать'},
  showFullNote: {en: 'Show Full Note', lt: 'Rodyti visą užrašą', ru: 'Показать полную заметку'},
  summarizing: {en: 'Summarizing...', lt: 'Atliekamas sutraukimas...', ru: 'Суммирование...'},
  summaryFailed: {en: 'Could not generate summary.', lt: 'Nepavyko sugeneruoti santraukos.', ru: 'Не удалось создать сводку.'},
  share: {en: 'Share', lt: 'Dalintis', ru: 'Поделиться'},
  copied: {en: 'Copied!', lt: 'Nukopijuota!', ru: 'Скопировано!'},
  analyzeTopic: {en: 'Analyze Topic', lt: 'Analizuoti temą', ru: 'Анализировать тему'},
  analysisTitle: {en: 'AI Analysis', lt: 'DI Analizė', ru: 'ИИ Анализ'},
  analyzing: {en: 'Analyzing topic...', lt: 'Analizuojama tema...', ru: 'Анализ темы...'},
  analysisFailed: {en: 'Analysis failed.', lt: 'Analizė nepavyko.', ru: 'Анализ не удался.'},
  analysisSystemInstruction: {en: 'You are an AI assistant specialized in the content of jw.org and the Watchtower Online Library (wol.jw.org). Analyze the following text. Your response MUST be a valid JSON object. The JSON object must have two keys: "analysisText" (a string containing your full analysis formatted with Markdown) and "highlights" (an array of strings, where each string is an exact key phrase, question, or important statement from the original text that should be highlighted). For the analysis, identify the main biblical themes, principles, any relevant scriptures, and publications from jw.org. Also, identify any questions and their corresponding answers within the text. Your knowledge base is exclusively from jw.org and its associated library. Do not mention other religions or sources.', lt: 'Jūs esate DI asistentas, kurio specializacija – jw.org ir „Watchtower“ internetinės bibliotekos (wol.jw.org) turinys. Išanalizuokite šį tekstą. Jūsų atsakymas PRIVALO būti galiojantis JSON objektas. JSON objektas turi turėti du raktus: "analysisText" (eilutė, kurioje yra jūsų visa analizė, suformatuota naudojant Markdown) ir "highlights" (eilučių masyvas, kuriame kiekviena eilutė yra tiksli raktinė frazė, klausimas ar svarbus teiginys iš pradinio teksto, kurį reikėtų paryškinti). Analizėje nustatykite pagrindines biblines temas, principus bei atitinkamus Rašto citatus ar leidinius, kurie aptariami jw.org. Taip pat nustatykite visus tekste esančius klausimus ir atitinkamus atsakymus į juos. Jūsų žinių bazė yra išimtinai iš jw.org ir susijusios bibliotekos. Neminykite kitų religijų ar šaltinių.', ru: 'Вы — ИИ-ассистент, специализирующийся на содержании сайта jw.org и Онлайн-библиотеки Сторожевой башни (wol.jw.org). Проанализируйте следующий текст. Ваш ответ ДОЛЖЕН быть действительным объектом JSON. Объект JSON должен иметь два ключа: "analysisText" (строка, содержащая ваш полный анализ, отформатированный с помощью Markdown) и "highlights" (массив строк, где каждая строка — это точная ключевая фраза, вопрос или важное утверждение из исходного текста, которое следует выделить). В анализе определите основные библейские темы, принципы, любые соответствующие места Писания или публикации, обсуждаемые на jw.org. Также определите любые вопросы и соответствующие ответы на них в тексте. Ваша база знаний основана исключительно на материалах с jw.org и связанной с ним библиотеки. Не упоминайте другие религии или источники.'},
  noContentToShare: {en: 'There is no polished note to share.', lt: 'Nėra nugludinto užrašo, kurį būtų galima bendrinti.', ru: 'Нет обработанной заметки для отправки.'},
  noContentToAnalyze: {en: 'There is no polished note to analyze.', lt: 'Nėra nugludinto užrašo, kurį būtų galima analizuoti.', ru: 'Нет обработанной заметки для анализа.'},
  downloadNote: {en: 'Download', lt: 'Atsisiųsti', ru: 'Скачать'},
  downloadNoteTitle: {en: 'Download Note', lt: 'Atsisiųsti užrašą', ru: 'Скачать заметку'},
  downloadAnalyzedNote: {en: 'Download with Analysis', lt: 'Atsisiųsti su analize', ru: 'Скачать с анализом'},
  downloadAnalyzedNoteTitle: {en: 'Download note with AI analysis (for Obsidian)', lt: 'Atsisiųsti užrašą su DI analize („Obsidian“ formatu)', ru: 'Скачать заметку с анализом ИИ (для Obsidian)'},
  micStatusInitializing: {en: 'Initializing...', lt: 'Inicijuojama...', ru: 'Инициализация...'},
  micStatusOK: {en: 'Mic OK', lt: 'Mikrofonas gerai', ru: 'Микрофон OK'},
  micStatusMuted: {en: 'Muted', lt: 'Išjungtas garsas', ru: 'Без звука'},
  micStatusDenied: {en: 'Permission Denied', lt: 'Leidimas atmestas', ru: 'Доступ запрещен'},
  micStatusUnavailable: {en: 'Mic Unavailable', lt: 'Mikrofonas nepasiekiamas', ru: 'Микрофон недоступен'},
  micStatusError: {en: 'Mic Error', lt: 'Mikrofono klaida', ru: 'Ошибка микрофона'},
};

type UIStringKey = keyof typeof UI_STRINGS;

interface AnalysisResult {
  analysisText: string;
  highlights: string[];
}

interface Note {
  id: string;
  rawTranscription: string;
  polishedNote: string;
  summarizedNote: string | null;
  analysis: AnalysisResult | null;
  isSummarized: boolean;
  timestamp: number;
}

type MicStatus = 'idle' | 'initializing' | 'ok' | 'muted' | 'denied' | 'error' | 'unavailable';

class VoiceNotesApp {
  private genAI: GoogleGenAI;
  private mediaRecorder: MediaRecorder | null = null;
  private recordButton: HTMLButtonElement;
  private recordingStatus: HTMLDivElement;
  private rawTranscription: HTMLDivElement;
  private polishedNote: HTMLDivElement;
  private newButton: HTMLButtonElement;
  private themeToggleButton: HTMLButtonElement;
  private themeToggleIcon: HTMLElement;
  private audioChunks: Blob[] = [];
  private isRecording = false;
  private currentNote: Note | null = null;
  private stream: MediaStream | null = null;
  private editorTitle: HTMLDivElement;
  private hasAttemptedPermission = false;

  private recordingInterface: HTMLDivElement;
  private liveRecordingTitle: HTMLDivElement;
  private liveWaveformCanvas: HTMLCanvasElement | null;
  private liveWaveformCtx: CanvasRenderingContext2D | null = null;
  private liveRecordingTimerDisplay: HTMLDivElement;
  private statusIndicatorDiv: HTMLDivElement | null;

  private micStatusIndicator: HTMLDivElement | null;
  private micStatusIcon: HTMLElement | null;
  private micStatusText: HTMLSpanElement | null;
  private audioTrack: MediaStreamTrack | null = null;
  private statusTimeoutId: number | null = null;

  private audioContext: AudioContext | null = null;
  private analyserNode: AnalyserNode | null = null;
  private waveformDataArray: Uint8Array | null = null;
  private waveformDrawingId: number | null = null;
  private timerIntervalId: number | null = null;
  private recordingStartTime: number = 0;

  private currentLanguage: Language = 'en';
  private languageToggleButton: HTMLButtonElement;
  private languageMenu: HTMLDivElement;
  
  private tabButtons: NodeListOf<HTMLButtonElement>;
  private noteContents: NodeListOf<HTMLDivElement>;
  private activeTabIndicator: HTMLDivElement;
  
  private noteActions: HTMLDivElement;
  private summarizeButton: HTMLButtonElement;
  private regenerateButton: HTMLButtonElement;
  private analyzeButton: HTMLButtonElement;
  private shareButton: HTMLButtonElement;
  private downloadButton: HTMLButtonElement;
  private downloadAnalyzedButton: HTMLButtonElement;
  private analysisResultDiv: HTMLDivElement;

  constructor() {
    this.genAI = new GoogleGenAI({
      apiKey: process.env.API_KEY!,
    });

    this.recordButton = document.getElementById('recordButton') as HTMLButtonElement;
    this.recordingStatus = document.getElementById('recordingStatus') as HTMLDivElement;
    this.rawTranscription = document.getElementById('rawTranscription') as HTMLDivElement;
    this.polishedNote = document.getElementById('polishedNote') as HTMLDivElement;
    this.newButton = document.getElementById('newButton') as HTMLButtonElement;
    this.themeToggleButton = document.getElementById('themeToggleButton') as HTMLButtonElement;
    this.themeToggleIcon = this.themeToggleButton.querySelector('i') as HTMLElement;
    this.editorTitle = document.querySelector('.editor-title') as HTMLDivElement;
    this.languageToggleButton = document.getElementById('languageToggleButton') as HTMLButtonElement;
    this.languageMenu = document.getElementById('languageMenu') as HTMLDivElement;
    this.shareButton = document.getElementById('shareButton') as HTMLButtonElement;
    this.downloadButton = document.getElementById('downloadButton') as HTMLButtonElement;
    this.downloadAnalyzedButton = document.getElementById('downloadAnalyzedButton') as HTMLButtonElement;

    this.recordingInterface = document.querySelector('.recording-interface') as HTMLDivElement;
    this.liveRecordingTitle = document.getElementById('liveRecordingTitle') as HTMLDivElement;
    this.liveWaveformCanvas = document.getElementById('liveWaveformCanvas') as HTMLCanvasElement;
    this.liveRecordingTimerDisplay = document.getElementById('liveRecordingTimerDisplay') as HTMLDivElement;
    
    this.noteActions = document.querySelector('.note-actions') as HTMLDivElement;
    this.summarizeButton = document.getElementById('summarizeButton') as HTMLButtonElement;
    this.regenerateButton = document.getElementById('regenerateButton') as HTMLButtonElement;
    this.analyzeButton = document.getElementById('analyzeButton') as HTMLButtonElement;
    this.analysisResultDiv = document.getElementById('analysisResult') as HTMLDivElement;


    this.tabButtons = document.querySelectorAll('.tab-button');
    this.noteContents = document.querySelectorAll('.note-content');
    this.activeTabIndicator = document.querySelector('.active-tab-indicator') as HTMLDivElement;
    
    if (this.liveWaveformCanvas) {
      this.liveWaveformCtx = this.liveWaveformCanvas.getContext('2d');
    } else {
      console.warn('Live waveform canvas element not found. Visualizer will not work.');
    }

    if (this.recordingInterface) {
      this.statusIndicatorDiv = this.recordingInterface.querySelector('.status-indicator') as HTMLDivElement;
    } else {
      console.warn('Recording interface element not found.');
      this.statusIndicatorDiv = null;
    }

    this.micStatusIndicator = document.getElementById('micStatusIndicator') as HTMLDivElement;
    if (this.micStatusIndicator) {
      this.micStatusIcon = this.micStatusIndicator.querySelector('i');
      this.micStatusText = document.getElementById('micStatusText') as HTMLSpanElement;
    }

    this.bindEventListeners();
    this.initTheme();
    this.initLanguage();
    this.initTabs();
    this.createNewNote();
  }

  private T(key: UIStringKey, ...args: any[]): string {
    const resource = UI_STRINGS[key];
    if (!resource) return key;

    let strOrFn: any;
    if (typeof resource === 'function') {
      strOrFn = resource.apply(null, args);
    } else {
      strOrFn = resource;
    }

    return strOrFn[this.currentLanguage] || strOrFn['en'];
  }

  private updateUIStrings() {
    document.querySelectorAll<HTMLElement>('[data-i18n]').forEach(el => {
      const key = el.dataset.i18n as UIStringKey;
      if (key) {
        // Handle button states
        if (el.id === 'summarizeButton' && this.currentNote?.isSummarized) {
          el.textContent = this.T('showFullNote');
        } else {
          el.textContent = this.T(key);
        }
      }
    });
    
    document.querySelectorAll<HTMLElement>('[data-i18n-span]').forEach(el => {
      const key = el.dataset.i18nSpan as UIStringKey;
       const span = el.querySelector('span');
      if (key && span) {
        span.textContent = this.T(key);
      }
    });

    document.querySelectorAll<HTMLElement>('[data-i18n-title]').forEach(el => {
      const key = el.dataset.i18nTitle as UIStringKey;
      if (key) {
        el.title = this.T(key);
      }
    });

    document.querySelectorAll<HTMLElement>('[data-i18n-placeholder]').forEach(el => {
      const key = el.dataset.i18nPlaceholder as UIStringKey;
      if (key) {
        const placeholderText = this.T(key);
        el.setAttribute('placeholder', placeholderText);
        if (el.classList.contains('placeholder-active')) {
          if (el.id === 'polishedNote') {
            el.innerHTML = placeholderText;
          } else {
            el.textContent = placeholderText;
          }
        }
      }
    });

    this.recordButton.setAttribute('title', this.isRecording ? this.T('stopRecording') : this.T('startRecording'));
    // Update share button text specifically as it's not a simple key lookup
    const shareSpan = this.shareButton.querySelector('span');
    if (shareSpan && !this.shareButton.classList.contains('copied')) {
        shareSpan.textContent = this.T('share');
    }
    const downloadSpan = this.downloadButton.querySelector('span');
    if(downloadSpan) {
        downloadSpan.textContent = this.T('downloadNote');
    }
  }

  private bindEventListeners(): void {
    this.recordButton.addEventListener('click', () => this.toggleRecording());
    this.newButton.addEventListener('click', () => this.createNewNote());
    this.themeToggleButton.addEventListener('click', () => this.toggleTheme());
    this.summarizeButton.addEventListener('click', () => this.toggleSummaryView());
    this.regenerateButton.addEventListener('click', () => this.getPolishedNote());
    this.analyzeButton.addEventListener('click', () => this.analyzeTopic());
    this.shareButton.addEventListener('click', () => this.shareNote());
    this.downloadButton.addEventListener('click', () => this.downloadSimpleNote());
    this.downloadAnalyzedButton.addEventListener('click', () => this.downloadAnalyzedNote());

    this.languageToggleButton.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleLanguageMenu();
    });
    document.querySelectorAll('.language-option').forEach(button => {
      button.addEventListener('click', (e) => {
        const lang = (e.currentTarget as HTMLElement).dataset.lang as Language;
        if (lang) {
          this.setLanguage(lang);
        }
      });
    });
    window.addEventListener('resize', this.handleResize.bind(this));
    document.addEventListener('click', () => {
      if (this.languageMenu.classList.contains('visible')) {
        this.toggleLanguageMenu(false);
      }
    });
  }

  private initTabs(): void {
    this.tabButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        this.setActiveTab(e.currentTarget as HTMLButtonElement);
      });
    });
    
    const initiallyActiveButton = document.querySelector('.tab-button.active') as HTMLButtonElement;
    if (initiallyActiveButton) {
      requestAnimationFrame(() => {
        this.setActiveTab(initiallyActiveButton, true);
      });
    }
  }

  private setActiveTab(activeButton: HTMLButtonElement, skipAnimation = false): void {
      if (!activeButton || !this.activeTabIndicator) return;

      this.tabButtons.forEach((btn) => btn.classList.remove('active'));
      activeButton.classList.add('active');

      const tabName = activeButton.getAttribute('data-tab');
      this.noteContents.forEach((content) => content.classList.remove('active'));

      const polishedTabActive = tabName === 'polished';
      document.getElementById(polishedTabActive ? 'polishedNote' : 'rawTranscription')?.classList.add('active');
      
      if (this.noteActions) {
        const hasPolishedContent = this.currentNote && this.currentNote.polishedNote;
        this.noteActions.classList.toggle('hidden', !polishedTabActive || !hasPolishedContent);
      }
      
      const originalTransition = this.activeTabIndicator.style.transition;
      if (skipAnimation) {
        this.activeTabIndicator.style.transition = 'none';
      } else {
        this.activeTabIndicator.style.transition = '';
      }

      this.activeTabIndicator.style.left = `${activeButton.offsetLeft}px`;
      this.activeTabIndicator.style.width = `${activeButton.offsetWidth}px`;

      if (skipAnimation) {
        this.activeTabIndicator.offsetHeight; // Force reflow
        this.activeTabIndicator.style.transition = originalTransition;
      }
  }

  private handleResize(): void {
    if (this.isRecording && this.liveWaveformCanvas && this.liveWaveformCanvas.style.display === 'block') {
      requestAnimationFrame(() => {
        this.setupCanvasDimensions();
      });
    }
    const currentActiveButton = document.querySelector('.tab-button.active') as HTMLButtonElement;
    if (currentActiveButton) {
        this.setActiveTab(currentActiveButton, true);
    }
  }

  private setupCanvasDimensions(): void {
    if (!this.liveWaveformCanvas || !this.liveWaveformCtx) return;

    const canvas = this.liveWaveformCanvas;
    const dpr = window.devicePixelRatio || 1;

    const rect = canvas.getBoundingClientRect();
    const cssWidth = rect.width;
    const cssHeight = rect.height;

    canvas.width = Math.round(cssWidth * dpr);
    canvas.height = Math.round(cssHeight * dpr);

    this.liveWaveformCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  private initLanguage(): void {
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && ['en', 'lt', 'ru'].includes(savedLanguage)) {
      this.setLanguage(savedLanguage, true);
    } else {
      this.setLanguage('en', true);
    }
    this.updateUIStrings();
  }

  private setLanguage(lang: Language, isInit = false): void {
    this.currentLanguage = lang;
    localStorage.setItem('language', lang);

    document.querySelectorAll('.language-option').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
    });

    if (!isInit) {
      this.updateUIStrings();
    }
    
    this.toggleLanguageMenu(false);
  }

  private toggleLanguageMenu(forceState?: boolean): void {
    this.languageMenu.classList.toggle('visible', forceState);
  }

  private initTheme(): void {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.body.classList.remove('light-mode');
      this.themeToggleIcon.classList.remove('fa-moon');
      this.themeToggleIcon.classList.add('fa-sun');
    } else {
      document.body.classList.add('light-mode');
      this.themeToggleIcon.classList.remove('fa-sun');
      this.themeToggleIcon.classList.add('fa-moon');
    }
  }

  private toggleTheme(): void {
    document.body.classList.toggle('light-mode');
    if (document.body.classList.contains('light-mode')) {
      localStorage.setItem('theme', 'light');
      this.themeToggleIcon.classList.remove('fa-sun');
      this.themeToggleIcon.classList.add('fa-moon');
    } else {
      localStorage.setItem('theme', 'dark');
      this.themeToggleIcon.classList.remove('fa-moon');
      this.themeToggleIcon.classList.add('fa-sun');
    }
  }

  private async toggleRecording(): Promise<void> {
    if (!this.isRecording) {
      await this.startRecording();
    } else {
      await this.stopRecording();
    }
  }

  private setupAudioVisualizer(): void {
    if (!this.stream || this.audioContext) return;

    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const source = this.audioContext.createMediaStreamSource(this.stream);
    this.analyserNode = this.audioContext.createAnalyser();

    this.analyserNode.fftSize = 2048;
    this.analyserNode.smoothingTimeConstant = 0.75;
    
    this.waveformDataArray = new Uint8Array(this.analyserNode.fftSize);

    source.connect(this.analyserNode);
  }

  private drawLiveWaveform(): void {
    if (!this.analyserNode || !this.waveformDataArray || !this.liveWaveformCtx || !this.liveWaveformCanvas || !this.isRecording) {
      if (this.waveformDrawingId) cancelAnimationFrame(this.waveformDrawingId);
      this.waveformDrawingId = null;
      return;
    }

    this.waveformDrawingId = requestAnimationFrame(() => this.drawLiveWaveform());
    this.analyserNode.getByteTimeDomainData(this.waveformDataArray);

    const ctx = this.liveWaveformCtx;
    const canvas = this.liveWaveformCanvas;

    const logicalWidth = canvas.clientWidth;
    const logicalHeight = canvas.clientHeight;

    ctx.clearRect(0, 0, logicalWidth, logicalHeight);
    
    const recordingColor = getComputedStyle(document.documentElement).getPropertyValue('--color-recording').trim() || '#ff3b30';
    ctx.lineWidth = 2;
    ctx.strokeStyle = recordingColor;
    ctx.beginPath();

    const bufferLength = this.analyserNode.fftSize;
    const sliceWidth = logicalWidth * 1.0 / bufferLength;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
        const v = this.waveformDataArray[i] / 128.0;
        const y = v * logicalHeight / 2;

        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
        x += sliceWidth;
    }

    ctx.lineTo(logicalWidth, logicalHeight / 2);
    ctx.stroke();
  }

  private updateLiveTimer(): void {
    if (!this.isRecording || !this.liveRecordingTimerDisplay) return;
    const now = Date.now();
    const elapsedMs = now - this.recordingStartTime;

    const totalSeconds = Math.floor(elapsedMs / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const hundredths = Math.floor((elapsedMs % 1000) / 10);

    this.liveRecordingTimerDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(hundredths).padStart(2, '0')}`;
  }

  private startLiveDisplay(): void {
    if (!this.recordingInterface || !this.liveRecordingTitle || !this.liveWaveformCanvas || !this.liveRecordingTimerDisplay) {
      console.warn('One or more live display elements are missing. Cannot start live display.');
      return;
    }

    this.recordingInterface.classList.add('is-live');
    this.liveRecordingTitle.style.display = 'block';
    this.liveWaveformCanvas.style.display = 'block';
    this.liveRecordingTimerDisplay.style.display = 'block';

    this.setupCanvasDimensions();

    if (this.statusIndicatorDiv) this.statusIndicatorDiv.style.display = 'none';

    const iconElement = this.recordButton.querySelector('.record-button-inner i') as HTMLElement;
    if (iconElement) {
      iconElement.classList.remove('fa-microphone');
      iconElement.classList.add('fa-stop');
    }

    const currentTitle = this.editorTitle.textContent?.trim();
    const placeholder = this.editorTitle.getAttribute('placeholder') || this.T('untitledNote');
    this.liveRecordingTitle.textContent = currentTitle && currentTitle !== placeholder ? currentTitle : this.T('recordText');

    this.setupAudioVisualizer();
    this.drawLiveWaveform();

    this.recordingStartTime = Date.now();
    this.updateLiveTimer();
    if (this.timerIntervalId) clearInterval(this.timerIntervalId);
    this.timerIntervalId = window.setInterval(() => this.updateLiveTimer(), 50);
  }

  private stopLiveDisplay(): void {
    if (!this.recordingInterface || !this.liveRecordingTitle || !this.liveWaveformCanvas || !this.liveRecordingTimerDisplay) {
      if (this.recordingInterface) this.recordingInterface.classList.remove('is-live');
      return;
    }
    this.recordingInterface.classList.remove('is-live');
    this.liveRecordingTitle.style.display = 'none';
    this.liveWaveformCanvas.style.display = 'none';
    this.liveRecordingTimerDisplay.style.display = 'none';

    if (this.statusIndicatorDiv) this.statusIndicatorDiv.style.display = 'flex';

    const iconElement = this.recordButton.querySelector('.record-button-inner i') as HTMLElement;
    if (iconElement) {
      iconElement.classList.remove('fa-stop');
      iconElement.classList.add('fa-microphone');
    }

    if (this.waveformDrawingId) {
      cancelAnimationFrame(this.waveformDrawingId);
      this.waveformDrawingId = null;
    }
    if (this.timerIntervalId) {
      clearInterval(this.timerIntervalId);
      this.timerIntervalId = null;
    }
    if (this.liveWaveformCtx && this.liveWaveformCanvas) {
      this.liveWaveformCtx.clearRect(0, 0, this.liveWaveformCanvas.width, this.liveWaveformCanvas.height);
    }

    if (this.audioContext) {
      if (this.audioContext.state !== 'closed') {
        this.audioContext.close().catch((e) => console.warn('Error closing audio context', e));
      }
      this.audioContext = null;
    }
    this.analyserNode = null;
    this.waveformDataArray = null;
  }
  
  private setMicStatus(status: MicStatus, message?: string): void {
      if (!this.micStatusIndicator || !this.micStatusIcon || !this.micStatusText) return;

      if (this.statusTimeoutId) {
        clearTimeout(this.statusTimeoutId);
        this.statusTimeoutId = null;
      }
      
      if (status === 'idle') {
        this.micStatusIndicator.classList.add('hidden');
        return;
      }

      this.micStatusIndicator.classList.remove('hidden');
      this.micStatusIndicator.className = 'mic-status'; // Reset classes
      
      let iconClass = '';
      let text = '';
      let statusClass = '';
      let autoHide = false;
      
      switch (status) {
        case 'initializing':
          iconClass = 'fas fa-spinner fa-spin';
          text = this.T('micStatusInitializing');
          statusClass = 'status-initializing';
          break;
        case 'ok':
          iconClass = 'fas fa-microphone';
          text = this.T('micStatusOK');
          statusClass = 'status-ok';
          autoHide = true;
          break;
        case 'muted':
          iconClass = 'fas fa-microphone-slash';
          text = this.T('micStatusMuted');
          statusClass = 'status-muted';
          break;
        case 'denied':
          iconClass = 'fas fa-ban';
          text = this.T('micStatusDenied');
          statusClass = 'status-denied';
          break;
        case 'unavailable':
            iconClass = 'fas fa-exclamation-triangle';
            text = this.T('micStatusUnavailable');
            statusClass = 'status-error';
            break;
        case 'error':
          iconClass = 'fas fa-exclamation-circle';
          text = message || this.T('micStatusError');
          statusClass = 'status-error';
          break;
      }
      
      this.micStatusIcon.className = iconClass;
      this.micStatusText.textContent = text;
      this.micStatusIndicator.classList.add(statusClass);

      if (autoHide) {
        this.statusTimeoutId = window.setTimeout(() => {
          this.micStatusIndicator?.classList.add('hidden');
        }, 3000);
      }
  }

  private handleMicMute = () => this.setMicStatus('muted');
  private handleMicUnmute = () => this.setMicStatus('ok');

  private cleanupAudioTrackListeners(): void {
      if (this.audioTrack) {
          this.audioTrack.removeEventListener('mute', this.handleMicMute);
          this.audioTrack.removeEventListener('unmute', this.handleMicUnmute);
          this.audioTrack = null;
      }
  }

  private async startRecording(): Promise<void> {
    try {
      this.setMicStatus('initializing');
      this.recordingStatus.textContent = '';
      this.audioChunks = [];

      this.cleanupAudioTrackListeners();
      if (this.stream) {
        this.stream.getTracks().forEach((track) => track.stop());
        this.stream = null;
      }
      if (this.audioContext && this.audioContext.state !== 'closed') {
        await this.audioContext.close();
        this.audioContext = null;
      }
      
      try {
        this.stream = await navigator.mediaDevices.getUserMedia({audio: true});
      } catch (err) {
        console.error('Failed with basic constraints:', err);
        this.stream = await navigator.mediaDevices.getUserMedia({
          audio: {echoCancellation: false, noiseSuppression: false, autoGainControl: false},
        });
      }

      const audioTracks = this.stream.getAudioTracks();
      if (audioTracks.length > 0) {
          this.audioTrack = audioTracks[0];
          this.audioTrack.addEventListener('mute', this.handleMicMute);
          this.audioTrack.addEventListener('unmute', this.handleMicUnmute);
          if (this.audioTrack.muted) {
              this.setMicStatus('muted');
          } else {
              this.setMicStatus('ok');
          }
      } else {
          this.setMicStatus('unavailable');
          this.recordingStatus.textContent = this.T('micNotFound');
          return;
      }

      try {
        this.mediaRecorder = new MediaRecorder(this.stream, {mimeType: 'audio/webm'});
      } catch (e) {
        console.error('audio/webm not supported, trying default:', e);
        this.mediaRecorder = new MediaRecorder(this.stream);
      }

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) this.audioChunks.push(event.data);
      };

      this.mediaRecorder.onstop = () => {
        this.stopLiveDisplay();

        if (this.audioChunks.length > 0) {
          const audioBlob = new Blob(this.audioChunks, {type: this.mediaRecorder?.mimeType || 'audio/webm'});
          this.processAudio(audioBlob).catch((err) => {
            console.error('Error processing audio:', err);
            this.recordingStatus.textContent = this.T('errorProcessing');
          });
        } else {
          this.recordingStatus.textContent = this.T('noAudioData');
        }

        if (this.stream) {
          this.stream.getTracks().forEach((track) => {
            track.stop();
          });
          this.stream = null;
        }
      };

      this.mediaRecorder.start();
      this.isRecording = true;

      this.recordButton.classList.add('recording');
      this.recordButton.setAttribute('title', this.T('stopRecording'));

      this.startLiveDisplay();
    } catch (error) {
      console.error('Error starting recording:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorName = error instanceof Error ? error.name : 'Unknown';

      if (errorName === 'NotAllowedError' || errorName === 'PermissionDeniedError') {
        this.setMicStatus('denied');
        this.recordingStatus.textContent = this.T('micDenied');
      } else if (errorName === 'NotFoundError' || (errorName === 'DOMException' && errorMessage.includes('Requested device not found'))) {
        this.setMicStatus('unavailable');
        this.recordingStatus.textContent = this.T('micNotFound');
      } else if (errorName === 'NotReadableError' || errorName === 'AbortError' || (errorName === 'DOMException' && errorMessage.includes('Failed to allocate audiosource'))) {
        this.setMicStatus('error', this.T('micInUse'));
        this.recordingStatus.textContent = this.T('micInUse');
      } else {
        this.setMicStatus('error', errorMessage);
        this.recordingStatus.textContent = this.T('errorRecording', errorMessage);
      }

      this.isRecording = false;
      this.cleanupAudioTrackListeners();
      if (this.stream) {
        this.stream.getTracks().forEach((track) => track.stop());
        this.stream = null;
      }
      this.recordButton.classList.remove('recording');
      this.recordButton.setAttribute('title', this.T('startRecording'));
      this.stopLiveDisplay();
    }
  }

  private async stopRecording(): Promise<void> {
    if (this.mediaRecorder && this.isRecording) {
      try {
        this.mediaRecorder.stop();
      } catch (e) {
        console.error('Error stopping MediaRecorder:', e);
        this.stopLiveDisplay();
      }

      this.isRecording = false;
      this.cleanupAudioTrackListeners();
      this.setMicStatus('idle');

      this.recordButton.classList.remove('recording');
      this.recordButton.setAttribute('title', this.T('startRecording'));
      this.recordingStatus.textContent = this.T('processingAudio');
    } else {
      if (!this.isRecording) this.stopLiveDisplay();
    }
  }

  private async processAudio(audioBlob: Blob): Promise<void> {
    if (audioBlob.size === 0) {
      this.recordingStatus.textContent = this.T('noAudioData');
      return;
    }

    try {
      URL.createObjectURL(audioBlob);

      this.recordingStatus.textContent = this.T('convertingAudio');

      const reader = new FileReader();
      const readResult = new Promise<string>((resolve, reject) => {
        reader.onloadend = () => {
          try {
            const base64data = reader.result as string;
            const base64Audio = base64data.split(',')[1];
            resolve(base64Audio);
          } catch (err) {
            reject(err);
          }
        };
        reader.onerror = () => reject(reader.error);
      });
      reader.readAsDataURL(audioBlob);
      const base64Audio = await readResult;

      if (!base64Audio) throw new Error('Failed to convert audio to base64');

      const mimeType = this.mediaRecorder?.mimeType || 'audio/webm';
      await this.getTranscription(base64Audio, mimeType);
    } catch (error) {
      console.error('Error in processAudio:', error);
      this.recordingStatus.textContent = this.T('errorProcessing');
    }
  }

  private async getTranscription(base64Audio: string, mimeType: string): Promise<void> {
    try {
      this.recordingStatus.textContent = this.T('gettingTranscription');
      const promptText = this.T('transcriptionPrompt');

      const response = await this.genAI.models.generateContent({
        model: MODEL_NAME,
        contents: {
          parts: [{text: promptText}, {inlineData: {mimeType: mimeType, data: base64Audio}}],
        },
      });

      const transcriptionText = response.text;

      if (transcriptionText) {
        this.rawTranscription.textContent = transcriptionText;
        if (transcriptionText.trim() !== '') {
          this.rawTranscription.classList.remove('placeholder-active');
        } else {
          const placeholder = this.rawTranscription.getAttribute('placeholder') || '';
          this.rawTranscription.textContent = placeholder;
          this.rawTranscription.classList.add('placeholder-active');
        }

        if (this.currentNote) this.currentNote.rawTranscription = transcriptionText;
        this.recordingStatus.textContent = this.T('transcriptionComplete');
        await this.getPolishedNote();
      } else {
        this.recordingStatus.textContent = this.T('transcriptionFailed');
        this.polishedNote.innerHTML = `<p><em>${this.T('couldNotTranscribe')}</em></p>`;
        this.rawTranscription.textContent = this.rawTranscription.getAttribute('placeholder');
        this.rawTranscription.classList.add('placeholder-active');
      }
    } catch (error) {
      console.error('Error getting transcription:', error);
      this.recordingStatus.textContent = this.T('transcriptionFailed');
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.polishedNote.innerHTML = `<p><em>${this.T('errorDuringTranscription', errorMessage)}</em></p>`;
      this.rawTranscription.textContent = this.rawTranscription.getAttribute('placeholder');
      this.rawTranscription.classList.add('placeholder-active');
    }
  }
  
  private styleSpeakerLabels(html: string): string {
    // Finds any <strong> tag containing text that ends with a colon
    // and adds a "speaker-label" class for styling.
    return html.replace(/<strong>(.*?:)<\/strong>/gi, '<strong class="speaker-label">$1</strong>');
  }

  private async getPolishedNote(): Promise<void> {
    if (!this.currentNote || !this.rawTranscription.textContent || this.rawTranscription.textContent.trim() === '' || this.rawTranscription.classList.contains('placeholder-active')) {
      this.recordingStatus.textContent = this.T('noTranscriptionToPolish');
      this.polishedNote.innerHTML = `<p><em>${this.T('noTranscriptionAvailable')}</em></p>`;
      const placeholder = this.polishedNote.getAttribute('placeholder') || '';
      this.polishedNote.innerHTML = placeholder;
      this.polishedNote.classList.add('placeholder-active');
      this.noteActions.classList.add('hidden');
      return;
    }
    
    try {
      this.noteActions.classList.add('hidden');
      this.recordingStatus.textContent = this.T('polishingNote');

      const response = await this.genAI.models.generateContent({
        model: MODEL_NAME,
        contents: this.rawTranscription.textContent,
        config: {
          systemInstruction: this.T('polishSystemInstruction'),
        },
      });
      const polishedText = response.text;

      if (polishedText) {
        const htmlContent = await marked.parse(polishedText);
        this.polishedNote.innerHTML = this.styleSpeakerLabels(htmlContent);
        this.polishedNote.classList.remove('placeholder-active');

        // Reset summary and analysis state, and update note content
        this.currentNote.polishedNote = polishedText;
        this.currentNote.summarizedNote = null;
        this.currentNote.analysis = null;
        this.currentNote.isSummarized = false;
        
        this.analysisResultDiv.classList.add('hidden');
        this.analysisResultDiv.innerHTML = '';
        this.updateDownloadButtonsState();
        
        this.summarizeButton.textContent = this.T('summarize');
        this.noteActions.classList.remove('hidden');

        let noteTitleSet = false;
        const lines = polishedText.split('\n').map((l) => l.trim());

        for (const line of lines) {
          if (line.startsWith('#')) {
            const title = line.replace(/^#+\s+/, '').trim();
            if (this.editorTitle && title) {
              this.editorTitle.textContent = title;
              this.editorTitle.classList.remove('placeholder-active');
              noteTitleSet = true;
              break;
            }
          }
        }

        if (!noteTitleSet && this.editorTitle) {
          for (const line of lines) {
            if (line.length > 0) {
              let potentialTitle = line.replace(/^[\*_\`#\->\s\[\]\(.\d)]+/, '');
              potentialTitle = potentialTitle.replace(/[\*_\`#]+$/, '');
              potentialTitle = potentialTitle.trim();

              if (potentialTitle.length > 3) {
                const maxLength = 60;
                this.editorTitle.textContent = potentialTitle.substring(0, maxLength) + (potentialTitle.length > maxLength ? '...' : '');
                this.editorTitle.classList.remove('placeholder-active');
                noteTitleSet = true;
                break;
              }
            }
          }
        }

        if (!noteTitleSet && this.editorTitle) {
          const currentEditorText = this.editorTitle.textContent?.trim();
          const placeholderText = this.editorTitle.getAttribute('placeholder') || this.T('untitledNote');
          if (currentEditorText === '' || currentEditorText === placeholderText) {
            this.editorTitle.textContent = placeholderText;
            if (!this.editorTitle.classList.contains('placeholder-active')) {
              this.editorTitle.classList.add('placeholder-active');
            }
          }
        }

        this.recordingStatus.textContent = this.T('notePolished');
      } else {
        this.recordingStatus.textContent = this.T('polishingFailed');
        this.polishedNote.innerHTML = `<p><em>${this.T('polishingReturnedEmpty')}</em></p>`;
        this.polishedNote.classList.add('placeholder-active');
      }
    } catch (error) {
      console.error('Error polishing note:', error);
      this.recordingStatus.textContent = this.T('polishingFailed');
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.polishedNote.innerHTML = `<p><em>${this.T('errorDuringPolishing', errorMessage)}</em></p>`;
      this.polishedNote.classList.add('placeholder-active');
    } finally {
        this.updateShareButtonState();
    }
  }
  
  private async toggleSummaryView(): Promise<void> {
    if (!this.currentNote) return;

    // If it's currently summarized, show the full note.
    if (this.currentNote.isSummarized) {
      await this.displayPolishedNote();
      this.currentNote.isSummarized = false;
      this.summarizeButton.textContent = this.T('summarize');
      return;
    }

    // If a summary already exists, show it.
    if (this.currentNote.summarizedNote) {
      this.polishedNote.innerHTML = this.styleSpeakerLabels(await marked.parse(this.currentNote.summarizedNote));
      this.currentNote.isSummarized = true;
      this.summarizeButton.textContent = this.T('showFullNote');
      return;
    }

    // Otherwise, generate a new summary.
    await this.summarizeNote();
  }

  private async summarizeNote(): Promise<void> {
    if (!this.currentNote || !this.currentNote.polishedNote) return;

    const originalStatus = this.recordingStatus.textContent;
    try {
      this.recordingStatus.textContent = this.T('summarizing');

      const response = await this.genAI.models.generateContent({
          model: MODEL_NAME,
          contents: this.currentNote.polishedNote,
          config: { systemInstruction: this.T('summarizePrompt') }
      });
      const summaryText = response.text;
      
      if (summaryText) {
        this.currentNote.summarizedNote = summaryText;
        this.polishedNote.innerHTML = this.styleSpeakerLabels(await marked.parse(summaryText));
        this.currentNote.isSummarized = true;
        this.summarizeButton.textContent = this.T('showFullNote');
        this.recordingStatus.textContent = originalStatus;
      } else {
        throw new Error('Summary returned empty.');
      }
    } catch (error) {
      console.error('Error summarizing note:', error);
      this.recordingStatus.textContent = this.T('summaryFailed');
      // Revert to original status after a delay
      setTimeout(() => this.recordingStatus.textContent = originalStatus, 3000);
    }
  }

  private updateShareButtonState(): void {
    const hasContent = this.currentNote?.polishedNote?.trim() !== '';
    this.shareButton.disabled = !hasContent;
  }
  
  private updateDownloadButtonsState(): void {
    const hasPolishedContent = this.currentNote?.polishedNote?.trim() !== '';
    this.downloadButton.disabled = !hasPolishedContent;

    const hasAnalysis = !!this.currentNote?.analysis;
    this.downloadAnalyzedButton.disabled = !hasAnalysis;
  }

  private async shareNote(): Promise<void> {
    if (!this.currentNote || !this.currentNote.polishedNote) {
        alert(this.T('noContentToShare'));
        return;
    }

    const title = (this.editorTitle.textContent || this.T('untitledNote')).trim();
    const textToShare = this.currentNote.polishedNote;

    if (navigator.share) {
        try {
            await navigator.share({
                title: title,
                text: textToShare,
            });
        } catch (error) {
            console.error('Error using Web Share API:', error);
        }
    } else {
        // Fallback to clipboard
        try {
            await navigator.clipboard.writeText(textToShare);
            const shareSpan = this.shareButton.querySelector('span');
            const shareIcon = this.shareButton.querySelector('i');
            if (!shareSpan || !shareIcon) return;

            const originalButtonText = this.T('share');
            const originalIconClass = 'fas fa-arrow-up-from-bracket';
            
            shareSpan.textContent = this.T('copied');
            shareIcon.className = 'fas fa-check';
            this.shareButton.classList.add('copied');

            setTimeout(() => {
                shareSpan.textContent = originalButtonText;
                shareIcon.className = originalIconClass;
                this.shareButton.classList.remove('copied');
            }, 2000);
        } catch (error) {
            console.error('Failed to copy text to clipboard:', error);
            alert('Failed to copy text.');
        }
    }
  }

  private async analyzeTopic(): Promise<void> {
    if (!this.currentNote || !this.currentNote.polishedNote) {
        this.recordingStatus.textContent = this.T('noContentToAnalyze');
        return;
    }
    
    const originalStatus = this.recordingStatus.textContent;
    try {
        this.recordingStatus.textContent = this.T('analyzing');
        this.analysisResultDiv.classList.add('hidden');

        const responseSchema = {
            type: Type.OBJECT,
            properties: {
              analysisText: { type: Type.STRING },
              highlights: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
            },
            required: ['analysisText', 'highlights'],
        };
        
        const response = await this.genAI.models.generateContent({
            model: MODEL_NAME,
            contents: this.currentNote.polishedNote,
            config: {
                systemInstruction: this.T('analysisSystemInstruction'),
                responseMimeType: "application/json",
                responseSchema: responseSchema,
            },
        });
        
        const analysisJson = response.text;

        if (analysisJson) {
            const analysisResult: AnalysisResult = JSON.parse(analysisJson);
            this.currentNote.analysis = analysisResult;
            await this.displayAnalysisAndHighlights();
            this.recordingStatus.textContent = originalStatus;
            this.updateDownloadButtonsState();
        } else {
            throw new Error('Analysis returned empty.');
        }
    } catch (error) {
        console.error('Error analyzing topic:', error);
        this.recordingStatus.textContent = this.T('analysisFailed');
        this.currentNote.analysis = null;
        this.updateDownloadButtonsState();
        await this.displayPolishedNote(); // Clear any previous highlights
        setTimeout(() => (this.recordingStatus.textContent = originalStatus), 3000);
    }
  }

  private async displayAnalysisAndHighlights(): Promise<void> {
    if (!this.currentNote || !this.currentNote.analysis) {
        this.analysisResultDiv.classList.add('hidden');
        await this.displayPolishedNote(); // Render without highlights
        return;
    }

    const { analysisText } = this.currentNote.analysis;

    // 1. Display the analysis text
    const htmlContent = await marked.parse(analysisText);
    this.analysisResultDiv.innerHTML = `
        <h4 class="analysis-title">${this.T('analysisTitle')}</h4>
        <div class="analysis-content">${htmlContent}</div>
    `;
    this.analysisResultDiv.classList.remove('hidden');

    // 2. Apply highlights to the polished note view
    await this.displayPolishedNote();
  }
  
  private async displayPolishedNote(): Promise<void> {
      if (!this.currentNote) return;

      let markdownToRender = this.currentNote.polishedNote;
      
      // If there's an analysis, apply highlights to the markdown before parsing.
      if (this.currentNote.analysis && this.currentNote.analysis.highlights) {
        // Create a temporary highlighted version for rendering
        let highlightedMarkdown = this.currentNote.polishedNote;
        const highlights = [...this.currentNote.analysis.highlights].sort((a,b) => b.length - a.length);

        for (const phrase of highlights) {
            // Escape special regex characters in the phrase
            const escapedPhrase = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            // Use a global regex to replace all occurrences
            highlightedMarkdown = highlightedMarkdown.replace(new RegExp(escapedPhrase, 'g'), `<mark>${phrase}</mark>`);
        }
        markdownToRender = highlightedMarkdown;
      }
      
      this.polishedNote.innerHTML = this.styleSpeakerLabels(await marked.parse(markdownToRender));
  }

  private downloadSimpleNote(): void {
    if (!this.currentNote || !this.currentNote.polishedNote) return;

    const title = (this.editorTitle.textContent || this.T('untitledNote')).trim().replace(/[\/\\?%*:|"<>]/g, '-');
    const fileContent = this.currentNote.polishedNote;

    const blob = new Blob([fileContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  private downloadAnalyzedNote(): void {
    if (!this.currentNote || !this.currentNote.analysis) return;

    let noteContent = this.currentNote.polishedNote;
    const highlights = [...this.currentNote.analysis.highlights].sort((a,b) => b.length - a.length);

    for (const phrase of highlights) {
        const escapedPhrase = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        noteContent = noteContent.replace(new RegExp(escapedPhrase, 'g'), `==${phrase}==`);
    }
    
    const title = (this.editorTitle.textContent || this.T('untitledNote')).trim().replace(/[\/\\?%*:|"<>]/g, '-');
    const tags = '#jw #library #jehova';

    const fileContent = `
${noteContent}

---

## ${this.T('analysisTitle')}
${this.currentNote.analysis.analysisText}

---
${tags}
    `.trim();

    const blob = new Blob([fileContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  private createNewNote(): void {
    this.currentNote = {
      id: `note_${Date.now()}`,
      rawTranscription: '',
      polishedNote: '',
      summarizedNote: null,
      analysis: null,
      isSummarized: false,
      timestamp: Date.now(),
    };
    
    this.noteActions.classList.add('hidden');
    this.analysisResultDiv.classList.add('hidden');
    this.analysisResultDiv.innerHTML = '';

    const rawPlaceholder = this.rawTranscription.getAttribute('placeholder') || this.T('rawPlaceholder');
    this.rawTranscription.textContent = rawPlaceholder;
    this.rawTranscription.classList.add('placeholder-active');

    const polishedPlaceholder = this.polishedNote.getAttribute('placeholder') || this.T('polishedPlaceholder');
    this.polishedNote.innerHTML = polishedPlaceholder;
    this.polishedNote.classList.add('placeholder-active');

    if (this.editorTitle) {
      const placeholder = this.editorTitle.getAttribute('placeholder') || this.T('untitledNote');
      this.editorTitle.textContent = placeholder;
      this.editorTitle.classList.add('placeholder-active');
    }
    this.recordingStatus.textContent = this.T('readyToRecord');
    this.cleanupAudioTrackListeners();
    this.setMicStatus('idle');
    this.updateShareButtonState();
    this.updateDownloadButtonsState();

    if (this.isRecording) {
      this.mediaRecorder?.stop();
      this.isRecording = false;
      this.recordButton.classList.remove('recording');
    } else {
      this.stopLiveDisplay();
    }
    this.updateUIStrings();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const app = new VoiceNotesApp();

  document.querySelectorAll<HTMLElement>('[contenteditable][placeholder]').forEach((el) => {
    function updatePlaceholderState() {
      const placeholder = el.getAttribute('placeholder')!;
      const currentText = (el.id === 'polishedNote' ? el.innerText : el.textContent)?.trim();

      if (currentText === '' || currentText === placeholder) {
        if (currentText === '') {
          if (el.id === 'polishedNote') {
            el.innerHTML = placeholder;
          } else {
            el.textContent = placeholder;
          }
        }
        el.classList.add('placeholder-active');
      } else {
        el.classList.remove('placeholder-active');
      }
    }

    updatePlaceholderState();

    el.addEventListener('focus', function() {
      const placeholder = this.getAttribute('placeholder')!;
      const currentText = (this.id === 'polishedNote' ? this.innerText : this.textContent)?.trim();
      if (currentText === placeholder) {
        if (this.id === 'polishedNote') this.innerHTML = '';
        else this.textContent = '';
        this.classList.remove('placeholder-active');
      }
    });

    el.addEventListener('blur', function() {
      updatePlaceholderState();
    });
  });
});

export {};

import { state } from './src/appState';
import { dom } from './src/domElements';
import { $ } from './src/utils';
import { loadInitialTheme, toggleTheme } from './src/theme';
import { loadInitialLayoutStates, toggleHeaderSection, setupLayoutObservers, cleanupLayoutObservers, toggleSettingsPanel } from './src/layout';
import { displayMessage, updateNavUI, copyExplanation, toggleFullScreenAudioPlayer, applyExplanationFontSize, increaseExplanationFontSize, decreaseExplanationFontSize, loadInitialExplanationFontSize } from './src/uiHelpers';
import { loadFile } from './src/fileHandler';
import { adjustZoomAndRender, go, handleSlideCounterInputChange, setupViewerPanelResizeObserver, cleanupViewerPanelResizeObserver, goToPage, toggleViewerFullScreen, loadInitialFullScreenState, clearCurrentHighlight, renderSlide } from './src/slideRenderer';
import { explainSlide, generateAndPlayAudioLecture, handleCurrentChunkEnded, seekToGlobalTime, revokeAndClearAudioData, managePrefetching, cancelNextSlidePreload, testHighlightScript } from './src/geminiService';
import { toggleSnippingMode, handleCanvasMouseDown, handleCanvasMouseMove, handleCanvasMouseUp, handleCanvasMouseLeave } from './src/snippingTool';
import { initAudioPlayer, resetCustomPlayerUI, showCustomPlayer, setPlayerState, updateSeekBarVisuals } from './src/audioPlayer';


const initUI = () => {
    // Populate DOM elements
    dom.header = $<HTMLElement>('pageHeader');
    dom.headerToggle = $<HTMLButtonElement>('headerToggle');
    dom.iconHeaderCollapse = $<SVGSVGElement>('iconHeaderCollapse');
    dom.iconHeaderExpand = $<SVGSVGElement>('iconHeaderExpand');
    dom.fileIn = $<HTMLInputElement>('fileInput');
    dom.fileName = $<HTMLSpanElement>('fileNameDisplay');
    dom.prev = $<HTMLButtonElement>('prevSlide');
    dom.next = $<HTMLButtonElement>('nextSlide');
    dom.slideCounterInput = $<HTMLInputElement>('slideCounterInput');
    dom.canvas = $<HTMLCanvasElement>('slideCanvas');
    dom.explContent = $<HTMLDivElement>('explanation-content');
    dom.viewerOverlay = $<HTMLDivElement>('viewerOverlay');
    dom.viewerPlaceholder = $<HTMLDivElement>('viewerPlaceholder');
    dom.explPlaceholder = $<HTMLDivElement>('explanationPlaceholder');
    dom.extraPrompt = $<HTMLInputElement>('extraPrompt');
    dom.genBtn = $<HTMLButtonElement>('genExplain');
    dom.modelSelect = $<HTMLSelectElement>('modelSelect');
    dom.languageSelect = $<HTMLSelectElement>('languageSelect');
    
    dom.zoomIn = $<HTMLButtonElement>('zoomIn');
    dom.zoomOut = $<HTMLButtonElement>('zoomOut');
    dom.zoomReset = $<HTMLButtonElement>('zoomReset');
    dom.zoomDisplay = $<HTMLSpanElement>('zoomDisplay');
    dom.copyBtn = $<HTMLButtonElement>('copyBtn');
    dom.genAudioBtn = $<HTMLButtonElement>('genAudioBtn');
    dom.stopAudioBtn = $<HTMLButtonElement>('stopAudioBtn');
    dom.slideContentPanel = $<HTMLDivElement>('slide-content');
    
    dom.themeToggle = $<HTMLButtonElement>('themeToggle'); 
    dom.themeIconSun = $<SVGSVGElement>('themeIconSun');
    dom.themeIconMoon = $<SVGSVGElement>('themeIconMoon');
    
    dom.settingsPanel = $<HTMLElement>('settingsPanel'); 
    dom.settingsPanelToggleBtn = $<SVGSVGElement>('appLogoSettingsToggle'); 
    dom.closeSettingsPanelBtn = $<HTMLButtonElement>('closeSettingsPanelBtn'); 

    dom.viewerArea = $<HTMLElement>('viewerArea');
    dom.explanationArea = $<HTMLElement>('explanationArea');
    dom.snipExplainBtn = $<HTMLButtonElement>('snipExplainBtn');
    dom.testHighlightsBtn = $<HTMLButtonElement>('testHighlightsBtn'); // New button

    dom.voiceProviderSelect = $<HTMLSelectElement>('voiceProviderSelect');
    dom.elevenLabsApiKeyInput = $<HTMLInputElement>('elevenLabsApiKeyInput');
    dom.elevenLabsVoiceSelect = $<HTMLSelectElement>('elevenLabsVoiceSelect');
    dom.googleCloudApiKeyInput = $<HTMLInputElement>('googleCloudApiKeyInput');
    dom.googleVoiceSelect = $<HTMLSelectElement>('googleVoiceSelect');
    dom.openAiApiKeyInput = $<HTMLInputElement>('openAiApiKeyInput');
    dom.openAiVoiceSelect = $<HTMLSelectElement>('openAiVoiceSelect');
    dom.audioPlayerElement = $<HTMLAudioElement>('audioPlayerElement');

    dom.customAudioPlayerContainer = $<HTMLDivElement>('customAudioPlayerContainer');

    dom.autoSlideshowToggleBtn = $<HTMLButtonElement>('autoSlideshowToggleBtn');
    dom.iconAutoSlideshowPlay = $<SVGSVGElement>('iconAutoSlideshowPlay');
    dom.iconAutoSlideshowPause = $<SVGSVGElement>('iconAutoSlideshowPause');

    dom.viewerFullScreenBtn = $<HTMLButtonElement>('viewerFullScreenBtn');
    dom.iconEnterFullScreen = $<SVGSVGElement>('iconEnterFullScreen');
    dom.iconExitFullScreen = $<SVGSVGElement>('iconExitFullScreen');

    dom.viewerFullScreenAudioToggleBtn = $<HTMLButtonElement>('viewerFullScreenAudioToggleBtn');
    dom.iconShowAudioPlayer = $<SVGSVGElement>('iconShowAudioPlayer');
    dom.iconHideAudioPlayer = $<SVGSVGElement>('iconHideAudioPlayer');

    dom.fontSizeIncreaseBtn = $<HTMLButtonElement>('fontSizeIncreaseBtn');
    dom.fontSizeDecreaseBtn = $<HTMLButtonElement>('fontSizeDecreaseBtn');
    dom.fontSizeDisplay = $<HTMLSpanElement>('fontSizeDisplay');


    if (dom.canvas) {
        const context = dom.canvas.getContext('2d');
        if (context) {
            dom.ctx = context;
        } else {
            console.error('Could not get 2D context for canvas "slideCanvas".');
            dom.ctx = null; 
        }
    } else {
        console.error('Canvas element with id "slideCanvas" not found.');
        dom.ctx = null;
    }
    
    const criticalElements = [
        dom.header, dom.headerToggle, dom.iconHeaderCollapse, dom.iconHeaderExpand,
        dom.fileIn, dom.fileName, dom.prev, dom.next, dom.slideCounterInput,
        dom.canvas, 
        dom.explContent, dom.viewerOverlay, dom.viewerPlaceholder, dom.explPlaceholder,
        dom.extraPrompt, dom.genBtn, dom.modelSelect, dom.languageSelect,
        dom.zoomIn, dom.zoomOut, dom.zoomReset, dom.zoomDisplay,
        dom.copyBtn, dom.genAudioBtn, dom.stopAudioBtn,
        dom.slideContentPanel, dom.themeToggle, dom.themeIconSun, dom.themeIconMoon,
        dom.settingsPanel, dom.settingsPanelToggleBtn, dom.closeSettingsPanelBtn, 
        dom.viewerArea, dom.explanationArea,
        dom.snipExplainBtn, dom.testHighlightsBtn, // Added testHighlightsBtn
        dom.voiceProviderSelect, dom.elevenLabsApiKeyInput, dom.elevenLabsVoiceSelect, 
        dom.googleCloudApiKeyInput, dom.googleVoiceSelect, dom.openAiApiKeyInput, dom.openAiVoiceSelect,
        dom.audioPlayerElement, dom.customAudioPlayerContainer,
        dom.autoSlideshowToggleBtn, dom.iconAutoSlideshowPlay, dom.iconAutoSlideshowPause,
        dom.viewerFullScreenBtn, dom.iconEnterFullScreen, dom.iconExitFullScreen,
        dom.viewerFullScreenAudioToggleBtn, dom.iconShowAudioPlayer, dom.iconHideAudioPlayer,
        dom.fontSizeIncreaseBtn, dom.fontSizeDecreaseBtn, dom.fontSizeDisplay
    ];
    if (criticalElements.some(el => !el) || !dom.ctx && dom.canvas) { 
        console.error("One or more critical UI elements are missing. Initialization aborted.", {
            missingElements: criticalElements.map((el, index) => el ? '' : `Element at index ${index} (${Object.keys(dom)[Object.values(dom).indexOf(el)] || 'unknown'}) is missing`).filter(Boolean)
        });
        document.body.innerHTML = "<p style='color:red; text-align:center; padding:20px;'>Error: Application UI could not be initialized. Critical DOM elements missing. Check console for details.</p>";
        return;
    }

    if (dom.canvas) dom.canvas.style.display = 'none';
    if (dom.viewerPlaceholder) dom.viewerPlaceholder.style.display = 'flex';
     if (dom.explPlaceholder) {
        dom.explPlaceholder.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
        <span>Explanation will appear here. Click "Explain" or "Lecture".</span>`;
    }

    if (dom.audioPlayerElement) {
        initAudioPlayer(dom.audioPlayerElement, seekToGlobalTime);
    }

    if (dom.elevenLabsApiKeyInput) {
        dom.elevenLabsApiKeyInput.value = state.elevenLabsApiKey || '';
    }
    if (dom.googleCloudApiKeyInput) {
        dom.googleCloudApiKeyInput.value = state.googleCloudApiKey || '';
    }
    if (dom.openAiApiKeyInput) {
        dom.openAiApiKeyInput.value = state.openaiApiKey || '';
    }
    if (dom.voiceProviderSelect) {
        dom.voiceProviderSelect.value = state.voiceProvider;
    }
    if (dom.elevenLabsVoiceSelect) {
        dom.elevenLabsVoiceSelect.value = state.selectedElevenLabsVoiceId || '21m00Tcm4TlvDq8ikWAM';
    }
    if (dom.googleVoiceSelect) {
        dom.googleVoiceSelect.value = state.selectedGoogleVoiceId || 'en-US-Wavenet-D';
    }
    if (dom.openAiVoiceSelect) {
        dom.openAiVoiceSelect.value = state.selectedOpenAiVoiceId || 'alloy';
    }
    
    const updateVoiceProviderUI = () => {
        const provider = state.voiceProvider;
        if (!dom.elevenLabsApiKeyInput || !dom.googleCloudApiKeyInput || !dom.openAiApiKeyInput ||
            !dom.elevenLabsVoiceSelect || !dom.googleVoiceSelect || !dom.openAiVoiceSelect) return;

        dom.elevenLabsApiKeyInput.classList.toggle('hidden', provider !== 'elevenlabs');
        dom.elevenLabsVoiceSelect.classList.toggle('hidden', provider !== 'elevenlabs');
        
        dom.googleCloudApiKeyInput.classList.toggle('hidden', provider !== 'google');
        dom.googleVoiceSelect.classList.toggle('hidden', provider !== 'google');

        dom.openAiApiKeyInput.classList.toggle('hidden', provider !== 'openai');
        dom.openAiVoiceSelect.classList.toggle('hidden', provider !== 'openai');
        updateNavUI();
    };
    
    updateVoiceProviderUI(); 


    dom.headerToggle.onclick = toggleHeaderSection;
    if(dom.settingsPanelToggleBtn) dom.settingsPanelToggleBtn.onclick = toggleSettingsPanel; 
    dom.closeSettingsPanelBtn.onclick = toggleSettingsPanel; 

    dom.prev!.onclick = () => go(-1); 
    dom.next!.onclick = () => go(1);
    dom.fileIn.onchange = (e) => { 
        const target = e.target as HTMLInputElement;
        loadFile(target.files ? target.files[0] : null);
    };

    dom.slideCounterInput?.addEventListener('focus', () => {
        if (!dom.slideCounterInput || !state.docContext || state.isBusy || state.isGeneratingAudio || state.isSpeaking) return;
        dom.slideCounterInput.type = 'number';
        dom.slideCounterInput.value = state.pageNum.toString();
        dom.slideCounterInput.select();
    });
    dom.slideCounterInput?.addEventListener('blur', () => {
        if (!dom.slideCounterInput) return;
        handleSlideCounterInputChange();
        dom.slideCounterInput.type = 'text'; 
        updateNavUI(); 
    });
    dom.slideCounterInput?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (!dom.slideCounterInput) return;
            handleSlideCounterInputChange();
            dom.slideCounterInput.blur();
        } else if (e.key === 'Escape') {
             if (!dom.slideCounterInput) return;
             dom.slideCounterInput.value = state.pageNum.toString(); 
             dom.slideCounterInput.blur(); 
        }
    });

    dom.genBtn!.onclick = () => explainSlide(); 
    dom.snipExplainBtn.onclick = toggleSnippingMode; 
    dom.testHighlightsBtn?.addEventListener('click', testHighlightScript);

    dom.genAudioBtn?.addEventListener('click', generateAndPlayAudioLecture);
    dom.stopAudioBtn?.addEventListener('click', async () => { 
        if (state.lectureAbortCtrl) {
            state.lectureAbortCtrl.abort("User stopped audio."); 
        }
        cancelNextSlidePreload("User stopped audio."); 
        
        if (dom.audioPlayerElement) {
            dom.audioPlayerElement.pause();
        }
        state.isSpeaking = false;
        state.isGeneratingAudio = false; 
        state.activeTTSFetches = 0;
        
        state.currentAudioChunkIndex = 0;
        state.cumulativeDurationOfPlayedChunks = 0;

        showCustomPlayer(state.audioChunkData.length > 0 && !!state.audioDataCacheKey); 
        if (state.audioChunkData.length > 0 && !!state.audioDataCacheKey) {
            setPlayerState('paused', 'Lecture stopped. Press play to resume or "Lecture" to restart.');
             if (dom.customSeekBar) dom.customSeekBar.value = "0"; 
             updateSeekBarVisuals();
        } else {
            resetCustomPlayerUI();
        }
        
        const mainExplanationExists = dom.explContent?.querySelector('.explanation-content-inner') || 
                                    dom.explContent?.querySelector('.message-box.error-message');
        if (!mainExplanationExists && !(state.audioChunkData.length > 0 && !!state.audioDataCacheKey)) {
            displayMessage('', 'placeholder'); 
        }

        if (state.currentHighlightCoordinates) {
            await clearCurrentHighlight();
        }
        updateNavUI();
    });

    dom.autoSlideshowToggleBtn?.addEventListener('click', () => {
        state.isAutoSlideshowEnabled = !state.isAutoSlideshowEnabled;
        localStorage.setItem('isAutoSlideshowEnabled', state.isAutoSlideshowEnabled.toString());
        if (!state.isAutoSlideshowEnabled) {
            cancelNextSlidePreload("Auto slideshow disabled.");
        }
        updateNavUI();
    });

    const handleParameterChangeForAudio = async () => { 
        if (state.lectureAbortCtrl) {
            state.lectureAbortCtrl.abort("Parameter changed");
        }
        cancelNextSlidePreload("Parameter changed.");
        
        if (state.currentHighlightCoordinates) {
            await clearCurrentHighlight();
        }
        revokeAndClearAudioData(true); 
        state.cache = {}; 
        state.audioScriptCache = {};


        const mainExplanationExists = dom.explContent?.querySelector('.explanation-content-inner') || dom.explContent?.querySelector('.message-box.error-message');
        if (!mainExplanationExists && !state.isSpeaking && !state.isGeneratingAudio) {
            displayMessage('', 'placeholder');
        }
        resetCustomPlayerUI();
        showCustomPlayer(false);
        updateNavUI();
    };

    dom.languageSelect?.addEventListener('change', handleParameterChangeForAudio);
    dom.modelSelect?.addEventListener('change', handleParameterChangeForAudio);
    dom.extraPrompt?.addEventListener('change', async () => { 
        if (state.lectureAbortCtrl) {
            state.lectureAbortCtrl.abort("Extra prompt changed");
        }
        cancelNextSlidePreload("Extra prompt changed.");
        
        if (state.currentHighlightCoordinates) {
            await clearCurrentHighlight();
        }
        revokeAndClearAudioData(true); 
        state.audioScriptCache = {}; 
        
        resetCustomPlayerUI();
        showCustomPlayer(false);
        updateNavUI();
    });


    dom.voiceProviderSelect?.addEventListener('change', (e) => {
        const selectElement = e.target as HTMLSelectElement;
        state.voiceProvider = selectElement.value as 'elevenlabs' | 'google' | 'openai';
        localStorage.setItem('voiceProvider', state.voiceProvider);
        updateVoiceProviderUI();
        handleParameterChangeForAudio();
    });

    dom.elevenLabsApiKeyInput?.addEventListener('input', (e) => {
        const inputElement = e.target as HTMLInputElement;
        state.elevenLabsApiKey = inputElement.value.trim();
        localStorage.setItem('elevenLabsApiKey', state.elevenLabsApiKey);
        updateNavUI(); 
    });
    dom.elevenLabsVoiceSelect?.addEventListener('change', (e) => {
        const selectElement = e.target as HTMLSelectElement;
        state.selectedElevenLabsVoiceId = selectElement.value;
        localStorage.setItem('selectedElevenLabsVoiceId', state.selectedElevenLabsVoiceId);
        handleParameterChangeForAudio(); 
    });

    dom.googleCloudApiKeyInput?.addEventListener('input', (e) => {
        const inputElement = e.target as HTMLInputElement;
        state.googleCloudApiKey = inputElement.value.trim();
        localStorage.setItem('googleCloudApiKey', state.googleCloudApiKey);
        updateNavUI();
    });
    dom.googleVoiceSelect?.addEventListener('change', (e) => {
        const selectElement = e.target as HTMLSelectElement;
        state.selectedGoogleVoiceId = selectElement.value;
        localStorage.setItem('selectedGoogleVoiceId', state.selectedGoogleVoiceId);
        handleParameterChangeForAudio(); 
    });

    dom.openAiApiKeyInput?.addEventListener('input', (e) => {
        const inputElement = e.target as HTMLInputElement;
        state.openaiApiKey = inputElement.value.trim();
        localStorage.setItem('openaiApiKey', state.openaiApiKey);
        updateNavUI();
    });
    dom.openAiVoiceSelect?.addEventListener('change', (e) => {
        const selectElement = e.target as HTMLSelectElement;
        state.selectedOpenAiVoiceId = selectElement.value;
        localStorage.setItem('selectedOpenAiVoiceId', state.selectedOpenAiVoiceId);
        handleParameterChangeForAudio(); 
    });
    
    if (dom.audioPlayerElement) {
        dom.audioPlayerElement.onplay = () => {
            state.isSpeaking = true;
            state.isGeneratingAudio = state.activeTTSFetches > 0 || 
                                      (state.audioChunkData.length > 0 && 
                                       state.currentAudioChunkIndex < state.audioChunkData.length &&
                                       !state.audioChunkData[state.currentAudioChunkIndex].blobUrl);
            setPlayerState('playing'); 
            updateNavUI();
            managePrefetching(); 
        };
        dom.audioPlayerElement.onpause = () => { 
            if (dom.audioPlayerElement && !dom.audioPlayerElement.ended && !state.isGeneratingAudio) {
                 state.isSpeaking = false; 
                 setPlayerState('paused');
            } else if (dom.audioPlayerElement && dom.audioPlayerElement.ended && state.audioChunkData.length === 0) {
                 state.isSpeaking = false;
                 setPlayerState('idle');
            }
            updateNavUI();
        };
        dom.audioPlayerElement.onended = async () => {
            if (state.audioChunkData.length > 0 && state.currentAudioChunkIndex < state.audioChunkData.length) {
                await handleCurrentChunkEnded(); 
            } 
            updateNavUI();
        };
        dom.audioPlayerElement.onerror = async (e: Event) => { 
            const audioEl = e.target as HTMLAudioElement;
            let errorMsg = 'Unknown audio error.';
            if (audioEl.error) {
                switch (audioEl.error.code) {
                    case MediaError.MEDIA_ERR_ABORTED: errorMsg = 'Playback aborted.'; break;
                    case MediaError.MEDIA_ERR_NETWORK: errorMsg = 'Network error during playback.'; break;
                    case MediaError.MEDIA_ERR_DECODE: errorMsg = 'Audio decoding error.'; break;
                    case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED: errorMsg = 'Audio source not supported/empty.'; break;
                    default: errorMsg = `Error (code ${audioEl.error.code}). ${audioEl.error.message || ''}`;
                }
                console.error(`Audio player error - Code: ${audioEl.error.code}, Message: ${errorMsg}`, e, audioEl.error);
            } else {
                 console.error('Audio player "error" event, no specific error object:', e);
            }
            
            setPlayerState('error', `Playback Error: ${errorMsg}`);
            
            if (state.lectureAbortCtrl) { 
                state.lectureAbortCtrl.abort("Audio playback error");
            }
            cancelNextSlidePreload("Audio playback error.");
            if (state.currentHighlightCoordinates) {
                await clearCurrentHighlight();
            }
            state.isSpeaking = false;
            state.isGeneratingAudio = false; 
            state.activeTTSFetches = 0;
            state.currentAudioChunkIndex = 0;
            state.cumulativeDurationOfPlayedChunks = 0;
            updateNavUI();
        };
        dom.audioPlayerElement.onprogress = () => {
            if (state.isSpeaking || state.isGeneratingAudio || (state.audioChunkData.length > 0 && dom.customAudioPlayerContainer && !dom.customAudioPlayerContainer.classList.contains('hidden'))) { 
                updateSeekBarVisuals();
            }
        };
    }

    const handleManualZoomAction = () => {
        if (state.currentHighlightCoordinates) { 
            clearCurrentHighlight().catch(e => console.error("Error clearing highlight on manual zoom", e));
        }
        state.isManuallyZoomed = true; 
    };

    dom.zoomIn?.addEventListener('click', () => {
        handleManualZoomAction();
        adjustZoomAndRender(state.zoomLevel * 1.25, 'none');
    });
    dom.zoomOut?.addEventListener('click', () => {
        handleManualZoomAction();
        adjustZoomAndRender(state.zoomLevel / 1.25, 'none');
    });
    dom.zoomReset?.addEventListener('click', () => {
        handleManualZoomAction();
        state.isManuallyZoomed = false; 
        adjustZoomAndRender(undefined, 'panel');
    });

    dom.copyBtn?.addEventListener('click', copyExplanation);
    dom.themeToggle?.addEventListener('click', toggleTheme);
    dom.viewerFullScreenBtn?.addEventListener('click', toggleViewerFullScreen);
    dom.viewerFullScreenAudioToggleBtn?.addEventListener('click', toggleFullScreenAudioPlayer);
    dom.fontSizeIncreaseBtn?.addEventListener('click', increaseExplanationFontSize);
    dom.fontSizeDecreaseBtn?.addEventListener('click', decreaseExplanationFontSize);


    dom.canvas.addEventListener('mousedown', handleCanvasMouseDown);
    dom.canvas.addEventListener('mousemove', handleCanvasMouseMove);
    dom.canvas.addEventListener('mouseup', handleCanvasMouseUp);
    dom.canvas.addEventListener('mouseleave', handleCanvasMouseLeave);

    loadInitialTheme();
    loadInitialLayoutStates(); 
    loadInitialFullScreenState(); 
    loadInitialExplanationFontSize();
    setupLayoutObservers();
    setupViewerPanelResizeObserver();
    
    updateNavUI();
    displayMessage('', 'placeholder'); 
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initUI);
} else {
    initUI(); 
}

window.addEventListener('beforeunload', () => {
    cleanupLayoutObservers();
    cleanupViewerPanelResizeObserver();
    if (state.isSpeaking || state.isGeneratingAudio) {
        if (state.lectureAbortCtrl) state.lectureAbortCtrl.abort("Page unloading");
    }
    cancelNextSlidePreload("Page unloading");
    
    state.currentHighlightCoordinates = null;
    revokeAndClearAudioData(true);


    if (state.currentRenderTask) {
        state.currentRenderTask.cancel();
    }
});
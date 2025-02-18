let playbackMode = false;
let ignoreClicksOnce = true;
let autoPageMode = false;
let displayedFullText = false;
let debugMode = false;

let $addNewStory;
let $display;
let $pageInput;
let $main;
let $footerAbout;
let $totalPages;
let $storySubmit;
let $storyInput;
let $storyTitle;
let $arrowButtons;
let $reloadButton;
let $shareButton;
let $modalShare;
let $closeModalShare;
let $closeModalOptions;
let $urlInput;
let $copyUrlButton;
let $copySuccessText;
let $modalOptions;
let $fullscreenButton;
let $playPauseButton;
let $header;
let $splash;
let $splashTitle;

let $setDelayDefaults;
let $setColorDefaults;

let $inputScrollDelay;
let $inputFullStopDelay;
let $inputNextPageDelay;
let $dynamicPageToggle;
let dynamicPageToggle = true;

let $colorThemes;
let $fontBaseColor;
let $fontQuoteColor;
let $BGColor;

let $fontSize;
let $fontSelector;

let $italicsToggle;
let italicsToggleCSS = '';
let $boldToggle;
let boldToggleCSS = '';

let $shadowToggle;
let shadowToggleOn = false;
let shadowSettings;
let $XOffset;
let $YOffset;
let $sBlur;
let $sColor;
let $effectThemes;
let effectSelectIndex = 0;
let $sApplyTo;
let sApplyToIndex = 0;
let $setShadowDefaults;

let $clearAllCache;

const delayScroll_default = 45;
const delayFullStop_default = 850;
const autoPageTimer_default = 3 * 1000;
const fontSize_default = 1.1;

let delayScroll = delayScroll_default;
let delayFullStop = delayFullStop_default;
let autoPageTimer = autoPageTimer_default;

let colorSettings;

let colorSelectIndex = 0;
let fontSize = fontSize_default;
let font = '"Libre Baskerville", serif';

let styleElement;

const timeoutIdsNextPage = [];
const timeoutIdsNextChar = [];
let invisCursorTimer;

let storyObj = {title: "", story: "", pageNum: 0};
let sampleStory = "";

const maxStories = 10;

const quoteMarksList = ['\"', "\'", "“", "”", "‘", "’"];

document.addEventListener("DOMContentLoaded", () => {
    const cUrlStory = purifyText(getQueryParams(window.location.href).story);

    if (cUrlStory) {
        storyObj.story = cUrlStory;
        saveStoryNewSlot(storyObj);
        window.location.href = window.location.href.split('?')[0];
        return;
    }

    if (debugMode) {
        for (let i = 0; i < maxStories; i++) {
            console.log(loadStory(i));
        }

        const storageUsage = getLocalStorageSizeAccurate();
        console.log(`LocalStorage usage: ${storageUsage.bytes} bytes (${storageUsage.megabytes} MB)`);
    }

    const savedSettings = JSON.parse(localStorage.getItem("TaleTeller_settings"));

    setColorDefaults();

    if (savedSettings) {
        delayScroll = savedSettings.delayScroll || delayScroll_default;
        delayFullStop = savedSettings.delayFullStop || delayFullStop_default;
        autoPageTimer = savedSettings.autoPageTimer || autoPageTimer_default; 
        fontSize =  savedSettings.fontSize || fontSize_default;
        colorSelectIndex = savedSettings.colorSelectIndex || 0;
        colorSettings = savedSettings.colorSettings || colorSettings;
        font = savedSettings.font || font;
        italicsToggleCSS = savedSettings.italicsToggleCSS || italicsToggleCSS;
        boldToggleCSS = savedSettings.boldToggleCSS || boldToggleCSS;
        shadowToggleOn = savedSettings.shadowToggleOn || shadowToggleOn;
        shadowSettings = savedSettings.shadowSettings || shadowSettings;
        effectSelectIndex = savedSettings.effectSelectIndex || effectSelectIndex;
        sApplyToIndex = savedSettings.sApplyToIndex || sApplyToIndex;
        dynamicPageToggle = Object.hasOwn(savedSettings, 'dynamicPageToggle') ? savedSettings.dynamicPageToggle : dynamicPageToggle;
    }
    
    loadElements();
    setEvents();

    setTimeout(() => {
        $splash.css("display","flex");
        $("#product-name").text("Tale Teller");
    }, 500);
    
    setTimeout(() => {
        $splash.css("display","none");
        loadMain();
      }, 2500);
});

function getLocalStorageSizeAccurate() {
    let total = 0;
    for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
            const value = localStorage.getItem(key);
            total += new Blob([key]).size + (value ? new Blob([value]).size : 0);
        }
    }
    const sizeInMB = total / (1024 * 1024); // Convert bytes to megabytes
    return { bytes: total, megabytes: sizeInMB.toFixed(4) };
}


function saveStoryNewSlot(newStoryObj) {
    for (let i = maxStories - 1; i >= 0; i--) {
        let existingStory = localStorage.getItem(`TaleTeller_story${i}`);

        if (existingStory) {
            localStorage.setItem(`TaleTeller_story${i+1}`, existingStory);
        }
    }

    localStorage.setItem(`TaleTeller_story${0}`, JSON.stringify(newStoryObj));
}

function loadStory(index) {
    return JSON.parse(localStorage.getItem(`TaleTeller_story${index}`));
}

function loadMain() {
    storyObj = loadStory(0) || storyObj;

    if (storyObj.story) {
        let story = decodeAndDecompress(storyObj.story);
        $storyInput.val(story);
        ignoreClicksOnce = false;
        setupStory();
    } else {
        //$storySubmit.css("visibility","visible");
        //$storyInput.css("visibility","visible");
        $addNewStory.css("display","block");
    }
}

function getQueryParams(url) {
    const params = {};
    const queryString = url.split('?')[1];
    if (queryString) {
        queryString.split('&').forEach(pair => {
            const [key, value] = pair.split('=');
            params[decodeURIComponent(key)] = decodeURIComponent(value || '');
        });
    }
    return params;
}

function loadElements() {
    $addNewStory = $("#addNewStory");
    $display = $("#display");
    $pageInput = $("#indicator");
    $main = $("main");
    $footerAbout = $('#footerAbout');
    $totalPages = $("#totalPages");
    $storySubmit = $("#storySubmit");
    $storyInput = $("#storyInput");
    $storyTitle = $('#storyTitle');
    $arrowButtons = $("#arrows");
    $reloadButton = $("#reloadButton");
    $shareButton = $("#shareButton");
    $optionsButton = $("#optionsButton");
    $fullscreenButton = $("#fullscreenButton");
    $playPauseButton = $("#playPauseButton");
    $header = $("header");
    $splash = $("#splash-screen");
    $splashTitle = $("#product-name");
    $modalShare = $("#modalShare");
    $closeModalShare = $("#closeModalShare");
    $copyUrlButton = $("#copyButton");
    $urlInput = $("#urlInput");
    $copySuccessText = $("#copySuccessText");
    $modalOptions = $("#modalOptions");
    $closeModalOptions = $("#closeModalOptions");

    $setDelayDefaults = $("#setDelayDefaults");
    $setColorDefaults = $("#setColorDefaults");

    $inputScrollDelay = $("#scrollDelay");
    $inputFullStopDelay = $("#fullStopDelay");
    $inputNextPageDelay = $("#nextPageDelay");
    $dynamicPageToggle = $("#dynamicPageToggle");
    $dynamicPageToggle.prop('checked', dynamicPageToggle);

    $inputScrollDelay.val(delayScroll);
    $inputFullStopDelay.val(delayFullStop);
    $inputNextPageDelay.val(autoPageTimer);

    $colorThemes = $("#colorThemes-select");
    $colorThemes.prop('selectedIndex', colorSelectIndex);

    $sApplyTo = $("#applyTo-select");
    $sApplyTo.prop('selectedIndex', sApplyToIndex);

    $fontBaseColor = $("#fontBaseColor");
    $fontQuoteColor = $("#fontQuoteColor");
    $BGColor = $("#BGColor");

    styleElement = document.createElement("style");
    styleElement.id = "dynamic-style";
    document.head.appendChild(styleElement);
    
    setColors(colorSettings[colorSelectIndex]);

    $fontSize = $("#fontSize");
    $display.css("font-size", `${fontSize}em`);
    $fontSize.val(fontSize);

    $italicsToggle = $("#italicsToggle");
    $italicsToggle.prop('checked', italicsToggleCSS ? true : false);
    $boldToggle = $("#boldToggle");
    $boldToggle.prop('checked', boldToggleCSS ? true : false);

    $shadowToggle = $('#dropshadowToggle');
    $shadowToggle.prop('checked', shadowToggleOn);
    setTextShadow();

    $XOffset = $('#XOffset');
    $XOffset.val(shadowSettings[effectSelectIndex].xoff);
    $YOffset = $('#YOffset');
    $YOffset.val(shadowSettings[effectSelectIndex].yoff);
    $sBlur = $('#radius');
    $sBlur.val(shadowSettings[effectSelectIndex].blur);
    $sColor = $('#dropshadowColor');
    $sColor.val(shadowSettings[effectSelectIndex].color);
    $setShadowDefaults = $('#setShadowDefaults');

    $effectThemes = $("#effectThemes-select");
    $effectThemes.prop('selectedIndex', effectSelectIndex);

    $fontSelector = $('#font-select');
    $fontSelector.val(font);
    $('main').css('font-family', font);

    $clearAllCache = $('#clearAllCache');

}

function setColorDefaults(setBaseColors = true, setShadowColors = true) {

    const searchObjects = (arr, searchStrings) =>
        arr.filter(obj => 
        searchStrings.some(searchString =>
            Object.values(obj).some(value => 
            String(value).toLowerCase().includes(searchString.toLowerCase())
            )
        )
    );
            
    //MAIN COLORS
    const updateObjects = (existingArray, updatedArray) => 
        existingArray.map(obj => 
            updatedArray.find(updatedObj => updatedObj.name === obj.name) || obj
    );

    let savedCustoms;

    if (colorSettings) {
        savedCustoms = searchObjects(colorSettings, ['custom1','custom2','custom3']);
    }

    if (setBaseColors) { 
        colorSettings = [{name: "dark", baseColor: "#e4e4e4", quoteColor: "#FFFFFF", BGColor: "#000000"},
            {name: "light", baseColor: "#000000", quoteColor: "#2E2E2E", BGColor: "#FFFFFF"},
            {name: "sepia", baseColor: "#5F4B32", quoteColor: "#7B6142", BGColor: "#FBF0D9"},
            {name: "green", baseColor: "#617b6b", quoteColor: "#708F7C", BGColor: "#c3e6cc"},
            {name: "plastic", baseColor: "#218AE0", quoteColor: "#299FFF", BGColor: "#F3A7D1"},
            {name: "custom1", baseColor: "#e4e4e4", quoteColor: "#FFFFFF", BGColor: "#000000"},
            {name: "custom2", baseColor: "#e4e4e4", quoteColor: "#FFFFFF", BGColor: "#000000"},
            {name: "custom3", baseColor: "#e4e4e4", quoteColor: "#FFFFFF", BGColor: "#000000"}
            ];
    }

    if (savedCustoms) {
        colorSettings = updateObjects(colorSettings, savedCustoms);
    }

    if (setShadowColors) {
        shadowSettings = [{ name: 'light3D', xoff: 1, yoff: 1, blur: 1, color: '#B3B3B3' },
            { name: 'dark3D', xoff: 1, yoff: 1, blur: 1, color: '#000000' },
            { name: 'darkGhost', xoff: 0, yoff: 0, blur: 10, color: '#FFFFFF' },
            { name: 'lightGhost', xoff: 0, yoff: 0, blur: 10, color: '#878787' },
            { name: 'vampire', xoff: 0, yoff: 3, blur: 3, color: '#FF7575' },
            { name: 'mutagen', xoff: 1, yoff: -1.5, blur: 5, color: '#A6FF00' },
            { name: 'custom1', xoff: 1, yoff: 1, blur: 1, color: '#000000' },
            { name: 'custom2', xoff: 1, yoff: 1, blur: 1, color: '#000000' },
            { name: 'custom3', xoff: 1, yoff: 1, blur: 1, color: '#000000' },
        ];
    }
}

function setColors(colorObj) {
    $display.css("color", colorObj.baseColor);
    $fontBaseColor.val(colorObj.baseColor);

    let shadow = 'none';

    if (shadowToggleOn) {
        shadow = `${shadowSettings[effectSelectIndex].xoff}px ${shadowSettings[effectSelectIndex].yoff}px 
        ${shadowSettings[effectSelectIndex].blur}px ${shadowSettings[effectSelectIndex].color}`;
    }

    $splash.css("color", colorObj.baseColor);
    $("body").css("background-color", colorObj.BGColor);
    $BGColor.val(colorObj.BGColor);
    $fontQuoteColor.val(colorObj.quoteColor);
    styleElement.textContent = `
        .quoteFormat {
            color: ${colorObj.quoteColor};
            font-style: ${italicsToggleCSS};
            font-weight: ${boldToggleCSS};
            text-shadow: ${shadow};
        }

        .svgHeaderButton:hover {
            background-color: ${colorObj.baseColor}
        }

        .svgHeaderButton div {
            color: ${colorObj.baseColor};
            transition: color 0.3s, color 0.3s;
        }

        .svgHeaderButton:hover div {
            color: ${colorObj.BGColor};
        }

        .centeredButtons button {
            background-color: transparent;
            color: ${colorObj.baseColor};
        }

        .centeredButtons button:hover {
            background-color: ${colorObj.baseColor};
            color: ${colorObj.BGColor};
        }

        #indicator {
            background-color: transparent;
            color: ${colorObj.baseColor};
        }

        #indicator:hover {
            background-color: ${colorObj.baseColor};
            color: ${colorObj.BGColor};
        }
    `;
    $('.svgHeaderButton').css('border-color', colorObj.BGColor);
    $('.centeredButtons button').css('border-color', colorObj.BGColor);
    $('.centeredButtons input').css('border-color', colorObj.BGColor);
    $('#totalPageContainer').css('color', colorObj.baseColor);

    $('#storyInput').css('color',colorObj.baseColor);
    $('#storyInput').css('background-color',colorObj.BGColor);

    $('#storyTitle').css('color',colorObj.baseColor);
    $('#storyTitle').css('background-color',colorObj.BGColor);
}

function setEvents() {
    $storySubmit.click(() => {

        let title = purifyText($storyTitle.val());
        let story = purifyText($storyInput.val());
    
        if (!story || story === "") {
            title = 'sample story';
            story = purifyText($("#textFrame").contents().text()); //sample story
        }
    
        if (!story || story === "") {
            story = "whoops, sample story couldn't load, sorry..."
        }
    
        storyObj.title = title;
        storyObj.story = compressAndEncode(story);
        storyObj.pageNum = 0;
    
        //localStorage.setItem("TaleTeller_story", JSON.stringify(storyObj));
        saveStoryNewSlot(storyObj);

        setupStory();
    });

    $closeModalShare.click(() => {
        $modalShare.addClass("hidden-display");
    });

    $closeModalOptions.click(() => {
        $modalOptions.addClass("hidden-display");
        saveSettings();
    });

    // Handle tab switching
    $(".tab-button").on("click", function () {
        $(".tab-button").removeClass("active");
        $(this).addClass("active");

        const target = $(this).data("target");
        $(".tab").removeClass("active");
        $(target).addClass("active");
    });

    // Close modal on outside click
    $(window).on("click", function (event) {

        let eventTarget = $(event.target);

        if (eventTarget.is($modalShare)) {
            $modalShare.addClass("hidden-display");
        } else if (eventTarget.is($modalOptions)) {
            $modalOptions.addClass("hidden-display");
            saveSettings();
        }

    });

    $copyUrlButton.on("click", async function () {
        try {
            await navigator.clipboard.writeText($urlInput.val());
            $copyUrlButton.text("Copied!");
            $copyUrlButton.css("background-color", "#828282");
            $copyUrlButton.css("cursor", "unset");
            setTimeout(() => {
                $copyUrlButton.text("Copy");
                $copyUrlButton.css("background-color", "");
                $copyUrlButton.css("cursor", "");
            }, 2000);

        } catch (err) {
            alert("Failed to copy URL: " + err);
        }
    });

    $header.on('mouseenter', () => {
        $header.removeClass('hidden');
    });

    $header.on('mouseleave', () => {
        $header.addClass('hidden');
        $("#totalPageContainer").css("visibility","hidden");
        $("#indicator:focus").blur();
    });

    function fullscreenchangeHandler(event) {
        if (!document.fullscreenElement) {
            disableFullscreen();
        }
    }
    document.addEventListener("fullscreenchange", fullscreenchangeHandler);

    function disableFullscreen() {
        $footerAbout.css("display","");
        $('body').removeClass('cursor-invisible');
        $(document).off('mousemove');
        clearTimeout(invisCursorTimer);
    }

    $fullscreenButton.click(() => {
        if (!document.fullscreenElement) {
            // Enter fullscreen mode
            document.documentElement.requestFullscreen()
              .then(() => {
                
                $footerAbout.css("display","none");

                const resetCursor = () => {
                    $('body').removeClass('cursor-invisible'); // Show the cursor
                    clearTimeout(invisCursorTimer);
                    invisCursorTimer = setTimeout(() => {
                        $('body').addClass('cursor-invisible'); // Hide the cursor after timeout
                    }, 2000);
                };

                $(document).on('mousemove', function () {
                    resetCursor();
                });
              })
              .catch(err => {
                console.error(`Failed to enter fullscreen mode: ${err.message}`);
              });
              $header.addClass('hidden');
          } else {
            // Exit fullscreen mode
            document.exitFullscreen()
              .then(() => {
                disableFullscreen();
              })
              .catch(err => {
                console.error(`Failed to exit fullscreen mode: ${err.message}`);
              });
          }
    });

    $dynamicPageToggle.on("change", () => {
        dynamicPageToggle = $dynamicPageToggle.prop('checked');
    });

    $setDelayDefaults.click(() => {
        $inputScrollDelay.val(delayScroll_default);
        $inputFullStopDelay.val(delayFullStop_default);
        $inputNextPageDelay.val(autoPageTimer_default);
        dynamicPageToggle = true;
        $dynamicPageToggle.prop('checked', dynamicPageToggle);
    });

    $setColorDefaults.click(() => {
        setColorDefaults(true, false);

        colorSelectIndex = 0;
        $colorThemes.prop('selectedIndex', colorSelectIndex);

        setColors(colorSettings[colorSelectIndex]);
    });

    $colorThemes.on("change", (event) => {
        colorSelectIndex = $colorThemes.prop('selectedIndex');
        setColors(colorSettings[colorSelectIndex]);
    });

    $fontBaseColor.on("change", (event) => {
        $display.css("color", $fontBaseColor.val());
        colorSettings[colorSelectIndex].baseColor = $fontBaseColor.val();
        setColors(colorSettings[colorSelectIndex]);
    });

    $fontQuoteColor.on("change", (event) => {
        let quoteColor = $fontQuoteColor.val();
        colorSettings[colorSelectIndex].quoteColor = quoteColor;

        setColors(colorSettings[colorSelectIndex]);
    });

    $BGColor.on("change", (event) => {
        $("body").css("background-color", $BGColor.val());
        colorSettings[colorSelectIndex].BGColor = $BGColor.val();
        setColors(colorSettings[colorSelectIndex]);
    });

    $shadowToggle.on('change', () => {
        setTextShadow();
    });

    $effectThemes.on("change", () => {
        effectSelectIndex = $effectThemes.prop('selectedIndex');
        $XOffset.val(shadowSettings[effectSelectIndex].xoff);
        $YOffset.val(shadowSettings[effectSelectIndex].yoff);
        $sBlur.val(shadowSettings[effectSelectIndex].blur);
        $sColor.val(shadowSettings[effectSelectIndex].color);
        setTextShadow();
    });

    $XOffset.on('input', () => {
        shadowSettings[effectSelectIndex].xoff = $XOffset.val();
        setTextShadow();
    });

    $YOffset.on('input', () => {
        shadowSettings[effectSelectIndex].yoff = $YOffset.val();
        setTextShadow();
    });

    $sBlur.on('input', () => {
        shadowSettings[effectSelectIndex].blur = $sBlur.val();
        setTextShadow();
    });

    $sColor.on('change', () => {
        shadowSettings[effectSelectIndex].color = $sColor.val();
        setTextShadow();
    });

    $sApplyTo.on('change', () => {
        sApplyToIndex = $sApplyTo.prop('selectedIndex');
        setTextShadow();
    });

    $setShadowDefaults.click(() => {
        setColorDefaults(false, true);

        effectSelectIndex = 0;
        $effectThemes.prop('selectedIndex', effectSelectIndex);
        sApplyToIndex = 0;
        $sApplyTo.prop('selectedIndex', sApplyToIndex);
        $shadowToggle.prop('checked', false);

        $XOffset.val(shadowSettings[effectSelectIndex].xoff);
        $YOffset.val(shadowSettings[effectSelectIndex].yoff);
        $sBlur.val(shadowSettings[effectSelectIndex].blur);
        $sColor.val(shadowSettings[effectSelectIndex].color);

        setTextShadow();
    });

    $clearAllCache.click(() => {
        localStorage.clear();
        window.location.reload();
    });

    $footerAbout.click(() => {
        showSettingsTab();
    });

    //$("#textFrame").on("load", function () {
        //sampleStory = $("#textFrame").contents().text();
    //});
//}
/*
    let maxRetries = 50; // 50 retries (every 100ms for up to 5 seconds)
    let retryInterval = 100; // Check every 100ms
    let attempts = 0;
  
    function checkIframeContent() {
      sampleStory = $("#textFrame").contents().text().trim();
  
      if (sampleStory) {
        console.log("File loaded successfully:", sampleStory);
      } else if (attempts < maxRetries) {
        attempts++;
        setTimeout(checkIframeContent, retryInterval);
      } else {
        console.warn("Failed to load content after multiple attempts.");
      }
    }
  
    checkIframeContent();
    */
}
  

function setTextShadow() {
    if ($shadowToggle.prop('checked')) {
        let shadow = `${shadowSettings[effectSelectIndex].xoff}px ${shadowSettings[effectSelectIndex].yoff}px 
            ${shadowSettings[effectSelectIndex].blur}px ${shadowSettings[effectSelectIndex].color}`;

        if ($sApplyTo.val() === 'all') {
            $display.css('text-shadow', shadow);
            $splash.css('text-shadow', shadow);
        } else {
            $display.css('text-shadow', 'none');
            $splash.css('text-shadow', 'none');
        }

        shadowToggleOn = true;
        setColors(colorSettings[colorSelectIndex]);
    } else {
        $display.css('text-shadow', 'none');
        $splash.css('text-shadow', 'none');
        shadowToggleOn = false;
        setColors(colorSettings[colorSelectIndex]);
    }
}

function saveSettings() {
    delayScroll = $inputScrollDelay.val();
    delayFullStop = $inputFullStopDelay.val();
    autoPageTimer = $inputNextPageDelay.val();

    settingsObj = { delayScroll: delayScroll, delayFullStop: delayFullStop, autoPageTimer: autoPageTimer, dynamicPageToggle: dynamicPageToggle,
    colorSettings: colorSettings, fontSize: fontSize, colorSelectIndex: colorSelectIndex, font: font, italicsToggleCSS: italicsToggleCSS,
    boldToggleCSS: boldToggleCSS, shadowToggleOn: shadowToggleOn, shadowSettings: shadowSettings, effectSelectIndex: effectSelectIndex,
    sApplyToIndex: sApplyToIndex };

    localStorage.setItem("TaleTeller_settings", JSON.stringify(settingsObj));
}

function purifyText(text) {
    if (text && text !== "") {
        const parser = new DOMParser();
        const doc = parser.parseFromString(text, 'text/html');
        text = doc.body.textContent || '';
        text = DOMPurify.sanitize(text);
        return text;
    }

    return undefined;
}

function resizeMainContainer() {
    if (Number(fontSize) >= 1.5) {
        $('main').css("width", "80%");
    } else if (Number(fontSize) <= 0.8) {
        $('main').css("width", "40%");
    } else {
        $('main').css("width", "60%");
    }
}

function setTrackedTimeout(callback, delay, idArr) {
    const id = setTimeout(callback, delay);
    idArr.push(id);
    return id;
}

function clearAllTimeouts() {
    clearTimeouts(timeoutIdsNextPage);
    clearTimeouts(timeoutIdsNextChar);
}

function clearTimeouts(idArr) {
    idArr.forEach(clearTimeout); // Clear each timeout
    idArr.length = 0;           // Reset the array
}

function showSettingsTab() {
    $modalOptions.removeClass("hidden-display");

    $(".tab").removeClass("active");
    $("#changeAbout").addClass('active');

    $(".tab-button").removeClass("active");
    $('.tab-button[data-target="#changeAbout"]').addClass('active');
}

function setupStory() {
    $display.css("display","block");
    $header.css("visibility","visible");

    setTimeout(() => {
        $header.addClass('hidden');
    }, 1 * 1000);

    playbackMode = true;
/*
    let title = purifyText($storyTitle.val());
    let story = purifyText($storyInput.val());

    if (!story || story === "") {
        story = purifyText($("#textFrame").contents().text()); //sample story
    }

    if (!story || story === "") {
        story = "whoops, sample story couldn't load, sorry..."
    }

    storyObj.title = title;
    storyObj.story = compressAndEncode(story);

    localStorage.setItem("TaleTeller_story", JSON.stringify(storyObj));
    saveStory(storyObj);
    */

    storyObj = loadStory(0);
    let story = decodeAndDecompress(storyObj.story);

    let shareLink = "";

    if (window.location.href === "https://taleteller.io/")
        shareLink = window.location.href;
    else
        shareLink = "http://127.0.0.1:3000/";

    shareLink += `?story=${storyObj.story}`;
    $urlInput.val(shareLink);

    //$('#addNewStory').remove();
    $addNewStory.css("display", "none");

    showPage(storyObj.pageNum, story);
}

function uint8ArrayToBase64(uint8Array) {
    return btoa(String.fromCharCode(...uint8Array));
}

function base64ToUint8Array(base64) {
    return Uint8Array.from(atob(base64), c => c.charCodeAt(0));
}

function compressAndEncode(input) {
    const compressed = pako.deflate(input); // Compress to Uint8Array
    const base64 = uint8ArrayToBase64(compressed); // Convert to Base64
    const encodedBlob = encodeURIComponent(base64);
    return encodedBlob;
}

function decodeAndDecompress(encodedBlob) {
    const base64 = decodeURIComponent(encodedBlob);
    const compressed = base64ToUint8Array(base64); // Convert Base64 back to Uint8Array
    const decompressed = pako.inflate(compressed, { to: 'string' }); // Decompress to string
    return decompressed;
}
    
function showPage(pageNum, story) {

    story = purifyText(story);

    const classQuoteFormat = "quoteFormat";

    let printText = true;
    let currentPage = pageNum;
    let paragraphs = getParagraphs(story);

    resizeMainContainer();

    updateIndicator();
    $totalPages.text(paragraphs.length);

    // Start the animation
    displayText(paragraphs[currentPage]);

    function getParagraphs(text) {
        // Split the text by one or more line breaks
        const paragraphs = text.split(/\r?\n+/);
        // Filter out empty strings and return the array
        return paragraphs.filter(paragraph => paragraph.trim() !== "");
    }

    /**
     * Measures the pixel width of a given word based on the current font style of the display container.
     * @param {string} word - The word to measure.
     * @returns {number} - The pixel width of the word.
     */
    function measureWordWidth(word, bolded = false, italicized = false) {
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        let boldFlag = bolded ? 'bold' : '';
        let italicFlag = italicized ? 'italic' : '';

        // Set the font style to match the container's computed font style
        const computedStyle = window.getComputedStyle($display[0]);
        context.font = `${boldFlag} ${italicFlag} ${computedStyle.fontSize} ${computedStyle.fontFamily}`;
        return context.measureText(word + " ").width;
    }

    /**
         * Wraps text to fit within the container's width by measuring the pixel width of each word.
         * @param {string} text - The input text to wrap.
         * @returns {string} - The wrapped text with newlines inserted.
         */
    function wrapText(text) {
        const containerWidth = $display[0].offsetWidth; // Get container width in pixels
        const words = text.split(" ");
        let line = "";
        let wrappedText = "";

        let boldFlag = false;
        let italicFlag = false;
        let disableFlagsNewline = false;

        let italicToggleOn = italicsToggleCSS ? true : false;
        let boldToggleOn = boldToggleCSS ? true : false;

        words.forEach(word => {

            let startsWithQuote = quoteMarksList.some(prefix => word.startsWith(prefix));
            let endsWithQuote = quoteMarksList.some(prefix => word.endsWith(prefix));
            
            if (startsWithQuote) {
                boldFlag = true && boldToggleOn;
                italicFlag = true && italicToggleOn;
                disableFlagsNewline = false;
            }

            const wordWidth = measureWordWidth(word, boldFlag, italicFlag);
            const lineWidth = measureWordWidth(line, boldFlag, italicFlag);
            const fudge = 20;

            if (lineWidth + wordWidth + fudge > containerWidth) {
                wrappedText += line.trim() + "\n"; // Add the current line and start a new one
                line = "";

                if (disableFlagsNewline) {
                    boldFlag = false;
                    italicFlag = false;
                    disableFlagsNewline = false;
                }
            }

            line += word + " ";

            if (endsWithQuote && (boldToggleOn || italicToggleOn)) {
                disableFlagsNewline = true;
            }
        });

        wrappedText += line.trim(); // Add the last line
        return wrappedText;
    }

    function preWordExists(text, wordList, index) {
        for (const word of wordList) {
            if (index - word.length < 0) return false;

            let extractedWord = " ";

            for (let i=index - word.length; i < index; i++) {
                extractedWord += text[i];
            }

            if (extractedWord === " " + word) return true;
        }
    }

    function isWhitespaceChar(text, index, char) {
        if (index >= text.length) return false;

        return /\s+/.test(text[index]);
    }

    function isStartChar(text, index) {
        if (index + 1 >= text.length) return false;

        return !/\s+/.test(text[index + 1]);
    }

    function isEndChar(text, index) {
        if (index - 1 < 0 || index >= text.length) return false;

        return !/\s+/.test(text[index - 1]) && /\s+/.test(text[index + 1]);
    }

    function isStartEndChar(text, index) {
        if (index - 1 < 0 || index >= text.length) return true;

        return /\s+/.test(text[index - 1]) || /\s+/.test(text[index + 1]);
    }

    function quoteComesNext(text, index) {
        if (index >= text.length) return false;

        return quoteMarksList.includes(text[index]);
    }

    function charIsSingleQuote(char) {
        return (char === '\'' || char === "‘" || char === "’");
    }

    function charIsDoubleQuote(char) {
        return (char === '\"' || char === "“" || char === "”");
    }

    function displayText(text) {
        $display.empty(); // Clear existing content
        let wrappedText = wrapText(text); // Approximate line length
        let index = 0;
        let doQuoteColor = false;
        let doDelayedPause = false;
        clearTimeouts(timeoutIdsNextPage);
        clearTimeouts(timeoutIdsNextChar);

        const titles = ["Mr.", "Mrs.", "Ms.", "Dr.", "Prof.", "Rev.", "Hon.", "Capt.", "Sgt.", "Lt.", "Gen.", "Col.", "Gov.", "Pres.", "Atty."];

        let startQuoteChar = "";

        function displayNextChar() {
            if (index < wrappedText.length && printText) {

                let t = wrappedText[index];
                let quoteColorClass = "";

                let doOneMoreQuoteColor = false;

                if (quoteMarksList.includes(t)) {
                    if (isStartEndChar(wrappedText, index) && (isStartChar(wrappedText, index) && startQuoteChar === "") ||
                    (isEndChar(wrappedText, index) && ((charIsSingleQuote(startQuoteChar) && charIsSingleQuote(t)) ||
                    (charIsDoubleQuote(startQuoteChar) && charIsDoubleQuote(t))))
                    )
                    {
                        doQuoteColor = !doQuoteColor;

                        if (doQuoteColor) {
                            startQuoteChar = t;
                        }

                        if (!doQuoteColor) {
                            doOneMoreQuoteColor = true;
                            startQuoteChar = "";  
                        }
                    }
                }

                if (doQuoteColor || doOneMoreQuoteColor) {
                    quoteColorClass = classQuoteFormat;
                }

                const letter = $(`<span id=t${index}>`).text(t).addClass(`fade-in ${quoteColorClass}`);
                $display.append(letter);
                index++;

                let d = delayScroll;

                if (doDelayedPause) {
                    doDelayedPause = false;
                    d = delayFullStop;
                }

                switch (t) {
                    case '?':
                    case '!':
                    case '.' :
                        if (preWordExists(wrappedText, titles, index)) break;
                        doDelayedPause = quoteComesNext(wrappedText, index);
                        if (!doDelayedPause && ((isWhitespaceChar(wrappedText, index, " ")) || index >=  paragraphs.length - 1)) {
                            d = delayFullStop;
                        }
                            
                        break;
                }

                if (index > 10) {
                    $("#t" + (index - 11)).removeClass("fade-in");
                }

                setTrackedTimeout(displayNextChar, d, timeoutIdsNextChar)
            } else {
                printText = false;
                ignoreClicksOnce = false;

                if (currentPage >= paragraphs.length - 1) { //last page
                    stopAutoPlay();
                } else if (!displayedFullText) {
                    checkAutoPlay(false, wrappedText.split("\n").length);
                }
            }
        }

        displayNextChar();
    }

    function checkAutoPlay(doNow = false, lineLength = -1) {
        if (autoPageMode) {
            let timer = autoPageTimer;

            if (dynamicPageToggle) {
                switch(lineLength) {    
                    case 1:
                        timer /= 2
                        break;
                    case 2:
                        timer /= 1.5
                        break;
                    case 3:
                        timer /= 1;
                        break;
                }
            }

            if (doNow) timer = 0;

            setTrackedTimeout(() => changePage(1), timer, timeoutIdsNextPage);
        } 
    }

    function displayFullText(text) {
        displayedFullText = true;
        $display.empty(); // Clear existing content
        let wrappedText = wrapText(text); 
        let formattedText = setFullTextEffects(wrappedText);
        $display.append(formattedText);
        clearTimeouts(timeoutIdsNextPage);
        clearTimeouts(timeoutIdsNextChar);
        checkAutoPlay();
    }

    function setFullTextEffects(text) {
        // Regular expression to match text in double quotes
        //let updatedString = text.replace(/(?<=\s|^)(["'“”‘’])([^"'“”‘’]+)\1(?=\s|[.,!?;:]|$)/g, `<span class=${classQuoteFormat}>$1$2$1</span>`);

        let startQuoteChar = "";
        let words = text.split(/\s+/);
        let updatedText = "";

        for (let i = 0; i < words.length; i++) {
            let word = words[i];
            let startChar = word[0];
            let endChar = word[word.length-1];

            if (quoteMarksList.includes(startChar)) {
                if (startQuoteChar === "") {
                    startQuoteChar = startChar;
                    word = `<span class=${classQuoteFormat}>${word}`;
                }
            }

            if (quoteMarksList.includes(endChar)) {
                if ((charIsDoubleQuote(startQuoteChar) && charIsDoubleQuote(endChar)) ||
                (charIsSingleQuote(startChar) && charIsSingleQuote(endChar))) {
                    startQuoteChar = "";
                    word = `${word}</span>`;
                }
            }

            updatedText += `${word} `;
        }
/*
        let updatedString = text.replace(
            /(?<=\s|^)(["“‘'])([^"'“”‘’]+?(?:\b'\b[^"'“”‘’]*)*)(["”’'])(?=\s|[.,!?;:]|$)/g, 
            (match, openQuote, text, closeQuote) => {
                // Ensure the opening and closing quotes are a valid pair
                const quotePairs = {
                    '"': '"',
                    '“': '”',
                    '‘': '’',
                    "'": "'"  // Normal single quotes, handled separately
                };
        
                // Check if the detected quotes form a valid pair
                if (quotePairs[openQuote] === closeQuote) {
                    return `<span class=${classQuoteFormat}>${openQuote}${text}${closeQuote}</span>`;
                }
        
                return match; // If not a valid pair, keep the original text
            }
        );
        */
       

        return updatedText;
    }

    function updateIndicator() {
        $pageInput.val(currentPage + 1); // Display 1-based index
    }

    function goToParagraph(index) {
        if (index >= 0 && index < paragraphs.length) {
            currentPage = index;
            printText = true;
            displayedFullText = false;
            displayText(paragraphs[currentPage]);
            updateIndicator();

            storyObj.pageNum = currentPage;
            localStorage.setItem("TaleTeller_story0", JSON.stringify(storyObj));
        }
    }

    //EVENTS
    $reloadButton.off('click').on('click', () => {
        stopAutoPlay();
        clearAllTimeouts();
        $display.css("display", "none");
        $addNewStory.css("display", "block");
        $header.css("visibility", "hidden");
        printText = false;
        playbackMode = false;
        ignoreClicksOnce = true;
        displayedFullText = false;
        $main.off("click");
    });

    $shareButton.off('click').on('click', () => {
        $modalShare.removeClass("hidden-display");

        if (playbackMode) {
            stopPlayBackAndViewFull();
        }
    });

    $optionsButton.off('click').on('click', () => {
        $modalOptions.removeClass("hidden-display");

        if (playbackMode) {
            stopPlayBackAndViewFull();
        }
    });

    $footerAbout.off('click').on('click', () => {
        if (playbackMode) {
            stopPlayBackAndViewFull();
        }

        showSettingsTab();
    });

    $pageInput.off('click').on('click', () => {
        if (playbackMode) {
            stopPlayBackAndViewFull();
            $pageInput.val("");
        }
    });

    function stopPlayBackAndViewFull() {
        printText = false;
        stopAutoPlay();
        displayFullText(paragraphs[currentPage]);
    }

    $pageInput.off("focus").on("focus", (event) => {
        if (playbackMode) $("#totalPageContainer").css("visibility","visible");
    });

    $pageInput.off("blur").on("blur", () => {
        if (playbackMode) {
            $("#totalPageContainer").css("visibility","hidden");
            $pageInput.val(currentPage+1);
        }
    });

    $main.off('click').on('click', () => {
        if (playbackMode) {
            changePage(1);
        }
    });

    $("#next").off('click').on('click', () => {
        if (playbackMode) changePage(1);
    });

    $("#prev").off('click').on('click', () => {
        if (playbackMode) changePage(-1);
    });

    $playPauseButton.off('click').on('click', () => {
        autoPageMode = !autoPageMode;

        if (autoPageMode) {
            $('#playIcon').css('display','none');
            $('#pauseIcon').css('display','inline');
            if (!printText) checkAutoPlay(true);
        } else {
            stopAutoPlay();
        }
    });

    $fontSelector.off('change').on('change', () => {
        font = $fontSelector.val();

        $('main').css('font-family', $fontSelector.val());

        setTimeout(() => { //wait for browser to load font
            displayFullText(paragraphs[currentPage]);
        }, 100);

    });

    $fontSize.off('change').on('change', () => {
        fontSize = $fontSize.val();
        $display.css("font-size", `${fontSize}em`);

        resizeMainContainer();

        displayFullText(paragraphs[currentPage]);
    });

    $italicsToggle.off('change').on('change', () => {
        if ($italicsToggle.prop('checked')) {
            italicsToggleCSS = 'italic';
        } else {
            italicsToggleCSS = '';
        }

        setColors(colorSettings[colorSelectIndex]);

        setTimeout(() => { //wait for browser to load font
            displayFullText(paragraphs[currentPage]);
        }, 100);
    });

    $boldToggle.off('change').on('change', () => {
        if ($boldToggle.prop('checked')) {
            boldToggleCSS = 'bold';
        } else {
            boldToggleCSS = '';
        }

        setColors(colorSettings[colorSelectIndex]);

        setTimeout(() => { //wait for browser to load font
            displayFullText(paragraphs[currentPage]);
        }, 100);
    });

    function stopAutoPlay() {
        autoPageMode = false;
        $('#playIcon').css('display','inline');
        $('#pauseIcon').css('display','none');
        clearTimeouts(timeoutIdsNextPage);
    }

    // Handle Enter key for indicator input
    $pageInput.off("keypress").on("keypress", (event) => {
        if (event.key === "Enter") {
            const inputValue = parseInt($pageInput.val(), 10) - 1; // Convert to 0-based index
            if (!isNaN(inputValue)) {
                goToParagraph(inputValue);
            }

            $pageInput.blur();
            updateIndicator();
        }
    });

    function handleKeyDown(event) {
        if (!playbackMode) return;

        if (event.key === "ArrowLeft") {
            changePage(-1);
        } else if (event.key === "ArrowRight") {
            changePage(1);
        } else if (event.key === " ") { // Space key
            changePage(1);
        }
    };

    document.removeEventListener("keydown", handleKeyDown);
    document.addEventListener("keydown", handleKeyDown);

    function changePage(pageMod) {

        if (ignoreClicksOnce) {
            ignoreClicksOnce = false;
            return;
        }

        if (printText) {
            printText = false;
            displayFullText(paragraphs[currentPage]);
        } else {
            
            let allowPageChange = (pageMod === 0 || pageMod > 0 && currentPage < paragraphs.length - 1) || 
                (pageMod < 0 && currentPage > 0);

            if (allowPageChange) {
                displayedFullText = false;
                printText = true;
                currentPage += pageMod;
                displayText(paragraphs[currentPage]);
                updateIndicator();
            }
        }

        storyObj.pageNum = currentPage;
        localStorage.setItem("TaleTeller_story0", JSON.stringify(storyObj));
    }
}
      
      
      
    
    
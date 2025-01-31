let playbackMode = false;
let ignoreClicksOnce = true;
let autoPageMode = false;
let displayedFullText = false;

let $display;
let $pageInput;
let $main;
let $footerAbout;
let $totalPages;
let $storySubmit;
let $storyInput;
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
let $colorThemes;
let $fontBaseColor;
let $fontQuoteColor;
let $BGColor;

let $fontSize;
let $fontSelector;

let $clearAllCache;

const delayScroll_default = 40;
const delayFullStop_default = 750;
const autoPageTimer_default = 3 * 1000;
const fontSize_default = 1.1;

let delayScroll = delayScroll_default;
let delayFullStop = delayFullStop_default;
let autoPageTimer = autoPageTimer_default;

let colorSettings = [];
const darkColorObj = {name: "dark", baseColor: "#e4e4e4", quoteColor: "#FFFFFF", BGColor: "#000000"};
const lightColorObj = {name: "light", baseColor: "#000000", quoteColor: "#2E2E2E", BGColor: "#FFFFFF"};
const sepiaColorObj = {name: "sepia", baseColor: "#5F4B32", quoteColor: "#7B6142", BGColor: "#FBF0D9"};
const oliveColorObj = {name: "green", baseColor: "#617b6b", quoteColor: "#708F7C", BGColor: "#c3e6cc"};
const customColorObj = {name: "custom", baseColor: "#e4e4e4", quoteColor: "#FFFFFF", BGColor: "#000000"};
const plasticColorObj = {name: "plastic", baseColor: "#218AE0", quoteColor: "#299FFF", BGColor: "#F3A7D1"};

let colorSelectIndex = 0;
let fontSize = fontSize_default;
let font = '"Libre Baskerville", serif';

let styleElement;

let cStory;
const timeoutIds = [];
let invisCursorTimer;

document.addEventListener("DOMContentLoaded", () => {
    const cUrlStory = getQueryParams(window.location.href).story;

    if (cUrlStory) {
        localStorage.setItem("TaleTeller_story", cUrlStory);
        window.location.href = window.location.href.split('?')[0];
        return;
    }

    const savedSettings = JSON.parse(localStorage.getItem("TaleTeller_settings"));

    colorSettings.push(structuredClone(darkColorObj));
    colorSettings.push(structuredClone(lightColorObj));
    colorSettings.push(structuredClone(sepiaColorObj));
    colorSettings.push(structuredClone(oliveColorObj));
    colorSettings.push(structuredClone(plasticColorObj));
    colorSettings.push(structuredClone(customColorObj));
    colorSettings.push(structuredClone(customColorObj));
    colorSettings.push(structuredClone(customColorObj));

    if (savedSettings) {
        delayScroll = savedSettings.delayScroll || delayScroll_default;
        delayFullStop = savedSettings.delayFullStop || delayFullStop_default;
        autoPageTimer = savedSettings.autoPageTimer || autoPageTimer_default; 
        fontSize =  savedSettings.fontSize || fontSize_default;
        colorSelectIndex = savedSettings.colorSelectIndex || 0;
        colorSettings = savedSettings.colorSettings || colorSettings;
        font = savedSettings.font || font;
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

function loadMain() {
    cStory = localStorage.getItem("TaleTeller_story");

    if (cStory) {
        let story = decodeAndDecompress(cStory);
        $storyInput.val(story);
        ignoreClicksOnce = false;
        setupStory();
    } else {
        $storySubmit.css("visibility","visible");
        $storyInput.css("visibility","visible");
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
    $display = $("#display");
    $pageInput = $("#indicator");
    $main = $("main");
    $footerAbout = $('#footerAbout');
    $totalPages = $("#totalPages");
    $storySubmit = $("#storySubmit");
    $storyInput = $("#storyInput");
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

    $inputScrollDelay.val(delayScroll);
    $inputFullStopDelay.val(delayFullStop);
    $inputNextPageDelay.val(autoPageTimer);

    $colorThemes = $("#colorThemes-select");
    $colorThemes.prop('selectedIndex', colorSelectIndex);

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

    $fontSelector = $('#font-select');
    $fontSelector.val(font);
    $('main').css('font-family', font);

    $clearAllCache = $('#clearAllCache');
}

function setColors(colorObj) {
    $display.css("color", colorObj.baseColor);
    //$display.css("text-shadow", `${colorObj.baseColor} 1px 1px 2px`);
    $fontBaseColor.val(colorObj.baseColor);
    $("body").css("background-color", colorObj.BGColor);
    $("body").css("color", colorObj.baseColor);
    $BGColor.val(colorObj.BGColor);
    $fontQuoteColor.val(colorObj.quoteColor);
    styleElement.textContent = `
        .quoteFormat {
            color: ${colorObj.quoteColor};
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
}

function setEvents() {
    $storySubmit.click(() => {
        setupStory();
    });

    $reloadButton.click(() => {
        localStorage.removeItem("TaleTeller_story");
        location.reload();
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

    $setDelayDefaults.click(() => {
        $inputScrollDelay.val(delayScroll_default);
        $inputFullStopDelay.val(delayFullStop_default);
        $inputNextPageDelay.val(autoPageTimer_default);
    });

    $setColorDefaults.click(() => {
        colorSettings[0] = structuredClone(darkColorObj);
        colorSettings[1] = structuredClone(sepiaColorObj);

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

        styleElement.textContent =
            `.quoteFormat {
                color: ${quoteColor};
            }`;
    });

    $BGColor.on("change", (event) => {
        $("body").css("background-color", $BGColor.val());
        colorSettings[colorSelectIndex].BGColor = $BGColor.val();
        setColors(colorSettings[colorSelectIndex]);
    });

    $clearAllCache.click(() => {
        localStorage.clear();
        window.location.reload();
    });

    $footerAbout.click(() => {
        showSettingsTab();
    });
}
/*
function rgbToHex(rgb) {
    // Extract the RGB values using a regular expression
    const match = rgb.match(/\d+/g);
    if (!match) return null;

    // Convert each value to hexadecimal and pad with zeros if necessary
    const [r, g, b] = match.map(num => parseInt(num, 10));
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;
}
*/

function saveSettings() {
    delayScroll = $inputScrollDelay.val();
    delayFullStop = $inputFullStopDelay.val();
    autoPageTimer = $inputNextPageDelay.val();

    settingsObj = { delayScroll: delayScroll, delayFullStop: delayFullStop, autoPageTimer: autoPageTimer,
    colorSettings: colorSettings, fontSize: fontSize, colorSelectIndex: colorSelectIndex, font: font};

    localStorage.setItem("TaleTeller_settings", JSON.stringify(settingsObj));
    //localStorage.setItem("delayScroll", cUrlStory);
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

function setTrackedTimeout(callback, delay) {
    const id = setTimeout(callback, delay);
    timeoutIds.push(id);
    return id;
}

function clearAllTimeouts() {
    timeoutIds.forEach(clearTimeout); // Clear each timeout
    timeoutIds.length = 0;           // Reset the array
}

function showSettingsTab() {
    $modalOptions.removeClass("hidden-display");

    $(".tab").removeClass("active");
    $("#changeAbout").addClass('active');

    $(".tab-button").removeClass("active");
    $('.tab-button[data-target="#changeAbout"]').addClass('active');
}

function setupStory() {
    $display.css("visibility","visible");
    $header.css("visibility","visible");

    setTimeout(() => {
        $header.addClass('hidden');
    }, 1 * 1000);

    playbackMode = true;

    let story = $storyInput.val();

    cStory = compressAndEncode(story);

    localStorage.setItem("TaleTeller_story", cStory);

    let shareLink = "";

    if (window.location.href === "https://taleteller.io/")
        shareLink = window.location.href;
    else
        shareLink = "http://127.0.0.1:3000/";

    shareLink += `?story=${cStory}`;
    $urlInput.val(shareLink);

    let result = {storyText: story};

    $storyInput.remove();
    $storySubmit.remove();

    showPage(0, result);
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
    
function showPage(pageNum, result) {

    let text = result.storyText || 'There once was a man from Bel Air, who sat in his old rocking chair. He yawned with a sigh, and stared at the sky, wishing something exciting was there!';

    const parser = new DOMParser();
    const doc = parser.parseFromString(text, 'text/html');
    text = doc.body.textContent || '';
    text = DOMPurify.sanitize(text);

    const classQuoteFormat = "quoteFormat";

    let printText = true;
    let currentPage = pageNum;
    let paragraphs = getParagraphs(text);

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
    function measureWordWidth(word) {
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        // Set the font style to match the container's computed font style
        const computedStyle = window.getComputedStyle($display[0]);
        context.font = `${computedStyle.fontSize} ${computedStyle.fontFamily}`;

        return context.measureText(word).width + 2; // + fudge factor
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

        words.forEach(word => {
            const wordWidth = measureWordWidth(word);
            const lineWidth = measureWordWidth(line);
            const fudge = 1;

            if (lineWidth + wordWidth + fudge > containerWidth) {
                wrappedText += line.trim() + "\n"; // Add the current line and start a new one
                line = "";
            }

            line += word + " ";
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

    function quoteComesNext(text, index) {
        if (index >= text.length) return false;

        return (text[index] === '\"' || text[index] === "\'" || text[index] === "*" || text[index] === "”");
    }

    function displayText(text) {
        $display.empty(); // Clear existing content
        let wrappedText = wrapText(text); // Approximate line length
        let index = 0;
        let doQuoteColor = false;
        let doDelayedPause = false;
        clearAllTimeouts();

        const titles = ["Mr.", "Mrs.", "Ms.", "Dr.", "Prof.", "Rev.", "Hon.", "Capt.", "Sgt.", "Lt.", "Gen.", "Col.", "Gov.", "Pres.", "Atty."];

        function displayNextLetter() {
            if (index < wrappedText.length && printText) {
                //printText = true;
                let t = wrappedText[index];
                let quoteColorClass = "";

                let doOneMoreQuoteColor = false;

                if (t === '\"') {
                    doQuoteColor = !doQuoteColor;

                    if (!doQuoteColor) {
                        doOneMoreQuoteColor = true;
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
                        if (!doDelayedPause) d = delayFullStop;
                        break;
                }

                if (index > 10) {
                    $("#t" + (index - 11)).removeClass("fade-in");
                }

                setTimeout(displayNextLetter, d);
            } else {
                printText = false;
                ignoreClicksOnce = false;

                if (!displayedFullText) checkAutoPlay();
            }
        }

        displayNextLetter();
    }

    function checkAutoPlay(doNow = false) {
        if (autoPageMode) {
            let timer = autoPageTimer;

            if (doNow) timer = 0;

            setTrackedTimeout(() => changePage(1), timer);
        } 
    }

    function displayFullText(text) {
        displayedFullText = true;
        $display.empty(); // Clear existing content
        let wrappedText = wrapText(text); 
        let formattedText = setFullTextEffects(wrappedText);
        $display.append(formattedText);
        clearAllTimeouts();
        checkAutoPlay();
    }

    function setFullTextEffects(text) {
        // Regular expression to match text in double quotes
        let updatedString = text.replace(/"([^"]*)"/g, `<span class=${classQuoteFormat}>"$1"</span>`);

        return updatedString;
    }

    function updateIndicator() {
        $pageInput.val(currentPage + 1); // Display 1-based index
    }

    function goToParagraph(index) {
        if (index >= 0 && index < paragraphs.length) {
            currentPage = index;
            printText = true;
            displayText(paragraphs[currentPage]);
            updateIndicator();
        }
    }

    //EVENTS
    $shareButton.click(() => {
        $modalShare.removeClass("hidden-display");

        if (playbackMode) {
            stopPlayBackAndViewFull();
        }
    });

    $optionsButton.click(() => {
        $modalOptions.removeClass("hidden-display");

        if (playbackMode) {
            stopPlayBackAndViewFull();
        }
    });

    $footerAbout.click(() => {
        if (playbackMode) {
            stopPlayBackAndViewFull();
        }
    });

    $pageInput.click(function () {
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

    $pageInput.on("focus", (event) => {
        if (playbackMode) $("#totalPageContainer").css("visibility","visible");
    });

    $pageInput.blur(() => {
        if (playbackMode) {
            $("#totalPageContainer").css("visibility","hidden");
            $pageInput.val(currentPage+1);
        }
    });

    $main.click(function () {
        if (playbackMode) changePage(1);
    });

    $("#next").click(function () {
        if (playbackMode) changePage(1);
    });

    $("#prev").click(function () {
        if (playbackMode) changePage(-1);
    });

    $playPauseButton.click(() => {
        autoPageMode = !autoPageMode;

        if (autoPageMode) {
            $('#playIcon').css('display','none');
            $('#pauseIcon').css('display','inline');
            if (!printText) checkAutoPlay(true);
        } else {
            stopAutoPlay();
        }
    });

    $fontSelector.on('change', () => {
        font = $fontSelector.val();

        $('main').css('font-family', $fontSelector.val());

        displayFullText(paragraphs[currentPage]);
    });

    $fontSize.on("change", () => {
        fontSize = $fontSize.val();
        $display.css("font-size", `${fontSize}em`);

        resizeMainContainer();

        displayFullText(paragraphs[currentPage]);
    });

    function stopAutoPlay() {
        autoPageMode = false;
        $('#playIcon').css('display','inline');
        $('#pauseIcon').css('display','none');
        clearAllTimeouts();
    }

    // Handle Enter key for indicator input
    $pageInput.on("keypress", function (event) {
        if (event.key === "Enter") {
            const inputValue = parseInt($pageInput.val(), 10) - 1; // Convert to 0-based index
            if (!isNaN(inputValue)) {
                goToParagraph(inputValue);
            }

            $pageInput.blur();
            updateIndicator();
        }
    });

    document.addEventListener("keydown", (event) => {
        if (!playbackMode) return;

        if (event.key === "ArrowLeft") {
            changePage(-1);
        } else if (event.key === "ArrowRight") {
            changePage(1);
        } else if (event.key === " ") { // Space key
            changePage(1);
        }
    });
    

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
                (pageMod < 0 && currentPage > 0)

            if (allowPageChange) {
                displayedFullText = false;
                printText = true;
                currentPage += pageMod;
                displayText(paragraphs[currentPage]);
                updateIndicator();
            }
        }
    }
}
      
      
      
    
    
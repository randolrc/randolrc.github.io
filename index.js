let playbackMode = false;
let ignoreClicksOnce = true;
let autoPageMode = false;
let displayedFullText = false;

let $display;
let $indicator;
let $container;
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

let cStory;
const timeoutIds = [];
let invisCursorTimer;

document.addEventListener("DOMContentLoaded", () => {
    const cUrlStory = getQueryParams(window.location.href).story;

    if (cUrlStory) {
        localStorage.setItem("story", cUrlStory);
        window.location.href = window.location.href.split('?')[0];
        return;
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
    cStory = localStorage.getItem("story");

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
    const queryString = url.split('?')[1]; // Get the part after '?'
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
    $indicator = $("#indicator");
    $container = $("#container");
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
}

function setEvents() {
    $storySubmit.click(() => {
        setupStory();
    });

    $reloadButton.click(() => {
        localStorage.clear();
        location.reload();
    });

    $closeModalShare.click(() => {
        $modalShare.addClass("hidden-display");
    });

    $closeModalOptions.click(() => {
        $modalOptions.addClass("hidden-display");
    });

    // Close modal on outside click
    $(window).on("click", function (event) {

        let eventTarget = $(event.target);

        if (eventTarget.is($modalShare)) {
            $modalShare.addClass("hidden-display");
        } else if (eventTarget.is($modalOptions)) {
            $modalOptions.addClass("hidden-display");
        }

    });

    $copyUrlButton.on("click", async function () {
        try {
            await navigator.clipboard.writeText($urlInput.val());
            $copySuccessText.css("display", "block");
            setTimeout(() => {
                $copySuccessText.css("display", "none");
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
            disableInvisCursor();
        }
    }
    document.addEventListener("fullscreenchange", fullscreenchangeHandler);

    function disableInvisCursor() {
        $('body').removeClass('cursor-invisible');
        $(document).off('mousemove');
        clearTimeout(invisCursorTimer);
    }

    $fullscreenButton.click(() => {
        if (!document.fullscreenElement) {
            // Enter fullscreen mode
            document.documentElement.requestFullscreen()
              .then(() => {
                //let timer;
                const timeout = 2000; // Time in milliseconds (2 seconds)

                const resetCursor = () => {
                    $('body').removeClass('cursor-invisible'); // Show the cursor
                    clearTimeout(invisCursorTimer);
                    invisCursorTimer = setTimeout(() => {
                        $('body').addClass('cursor-invisible'); // Hide the cursor after timeout
                    }, timeout);
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
                disableInvisCursor();
              })
              .catch(err => {
                console.error(`Failed to exit fullscreen mode: ${err.message}`);
              });
          }
    });
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

function setupStory() {
    $display.css("visibility","visible");
    $header.css("visibility","visible");

    setTimeout(() => {
        $header.addClass('hidden');
    }, 1 * 1000);

    playbackMode = true;

    let story = $storyInput.val();

    cStory = compressAndEncode(story);

    localStorage.setItem("story", cStory);

    let shareLink = `${window.location.href}?story=${cStory}`;
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
    const text = result.storyText || 'No text data found.';

    const classQuoteFormat = "quoteFormat";

    let delay = 40;
    let delayFullStop = 750;
    let delayComma = 40;
    const autoPageTimer = 3 * 1000;

    let printText = true;
    let currentPage = pageNum;
    let paragraphs = getParagraphs(text);

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

        return context.measureText(word).width + 2;
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

                let d = delay;

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
                    case ',' :
                        d = delayComma;
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
        $indicator.val(currentPage + 1); // Display 1-based index
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

    $indicator.click(function () {
        if (playbackMode) {
            stopPlayBackAndViewFull();
            const valueLength = $(this).val().length;
            this.setSelectionRange(valueLength, valueLength);
        }
    });

    function stopPlayBackAndViewFull() {
        printText = false;
        stopAutoPlay();
        displayFullText(paragraphs[currentPage]);
    }

    $indicator.on("focus", (event) => {
        if (playbackMode) $("#totalPageContainer").css("visibility","visible");
    });

    $indicator.blur(() => {
        if (playbackMode) $("#totalPageContainer").css("visibility","hidden");
    });

    $container.click(function () {
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
            $playPauseButton.find("img").attr("src","img/pause.svg");
            if (!printText) checkAutoPlay(true);
        } else {
            stopAutoPlay();
        }
    });

    function stopAutoPlay() {
        autoPageMode = false;
        $playPauseButton.find("img").attr("src","img/play.svg");
        clearAllTimeouts();
    }

    // Handle Enter key for indicator input
    $indicator.on("keypress", function (event) {
        if (event.key === "Enter") {
            const inputValue = parseInt($indicator.val(), 10) - 1; // Convert to 0-based index
            if (!isNaN(inputValue)) {
                goToParagraph(inputValue);
            }

            $indicator.blur();
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
            
            let allowPageChange = (pageMod > 0 && currentPage < paragraphs.length - 1) || (pageMod < 0 && currentPage > 0)

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
      
      
      
    
    
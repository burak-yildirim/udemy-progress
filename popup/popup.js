const browser = (function () {
    return window.msBrowser || window.browser || chrome || window.chrome;
})();


function popupOpen() {
    console.log("Extension popup is opened.");
    var tab = null;

    function sendBrowserMessage(obj) {
        browser.tabs.sendMessage(tab.id, obj);
    }

    function consoleLogger(log) {
        sendBrowserMessage({ command: "popupLog", log });
    }

    function setAnalyzeButton(status) {
        const analyzeButton = document.getElementById("analyzeButton");
        if (status === "disabled") {
            analyzeButton.setAttribute("disabled", "");
            analyzeButton.setAttribute("status", "disabled");
            analyzeButton.innerText = "Analyze";
        } else if (status === "ready") {
            analyzeButton.removeAttribute("disabled");
            analyzeButton.setAttribute("status", "ready");
            analyzeButton.innerText = "Analyze";
        } else if (status === "analyzing") {
            analyzeButton.removeAttribute("disabled");
            analyzeButton.setAttribute("status", "analyzing");
            analyzeButton.innerText = "Stop !";
        }

        return analyzeButton;
    }

    function buildAnalyzer(tabs) {
        tab = tabs[0];

        /**
         * If we have available tab for our URL, we are ready to analyze. Otherwise, 
         * we will not do any operation.
         */
        var regex = /[a-zA-Z:\/]*\.*udemy\.com\/[a-zA-Z-_]*\/learn\/lecture/g;
        if (!tab || !(regex.test(tab.url))) {
            // Make a good error handling here !!
            console.log("Udemy Progress is not available on this URL.");
            return;
        }

        document.getElementById("isValidUrl").innerHTML = "Valid URL.";


        const analyzeButton = setAnalyzeButton("ready");
        analyzeButton.addEventListener("click", function () {
            cleanError();
            var buttonStatus = analyzeButton.getAttribute("status");

            if (buttonStatus === "ready") {
                consoleLogger("Analyzation is starting..");
                setAnalyzeButton("analyzing");
                sendBrowserMessage({ command: "analyze" });
            } else if (buttonStatus === "analyzing") {
                consoleLogger("Operation is stopping..");
                setAnalyzeButton("ready");
                sendBrowserMessage({ command: "halt" });
            }
        });

        /**
         * Add listener for analyzation results.
         */
        browser.runtime.onMessage.addListener(function (message) {
            switch (message.code) {
                case "analyzeResult":
                    updateProgress(message);
                    break;
                default:
                    break;
            }
        });

    }

    function popupErrorHandler(error, errorToShow) {
        if (typeof errorToShow === 'undefined')
            errorToShow = "Error occured while running scripts :(";

        var errorParag = document.getElementById("errorParag");
        errorParag.innerText = errorToShow;
        errorParag.removeAttribute("hidden");

        setAnalyzeButton("ready");
        document.getElementById("buttonInfo").innerHTML = "";

        if (error)
            consoleLogger(`popup error : ${error}`);
    }

    function cleanError() {
        var errorParag = document.getElementById("errorParag");
        errorParag.innerText = "";
        errorParag.setAttribute("hidden", "");
    }

    function updateProgress(report) {
        document.getElementById("totalTime").innerText = `${report.totalTime} min`;
        document.getElementById("watchTime").innerText = `${report.watchTime} min`;
        document.getElementById("progress").innerText =
            `%${((report.watchTime / report.totalTime) * 100).toFixed(3)}`;
        document.getElementById("totalLectures").innerText = `${report.totalLectures}`;
        document.getElementById("finishedLectures").innerText = `${report.finishedLectures}`;
        document.getElementById("sectionCount").innerText = `${report.sectionCount}`;

        if (report.status === "analyzing") {
            setAnalyzeButton("analyzing");
            document.getElementById("buttonInfo").innerHTML = "Analyzing ..";
        } else if (report.status === "completed") {
            setAnalyzeButton("ready");
            document.getElementById("buttonInfo").innerHTML = "Completed";
        } else if (report.status === "halted") {
            setAnalyzeButton("ready");
            document.getElementById("buttonInfo").innerHTML = "Operation halted!";
        } else if (report.status === "error") {
            popupErrorHandler(undefined, report.errorToShow);
        }
    }

    /**
     * Standarts of API for firefox and chrome(like) browsers are different,
     * so we need to handle according to their standarts.
     */
    if (window.browser) {
        browser.tabs.query({
            active: true,
            currentWindow: true,
            url: "*://*.udemy.com/*/learn/lecture/*"
        }).then(buildAnalyzer)
            .catch(popupErrorHandler);
    }
    else if (window.chrome || chrome) {
        browser.tabs.query({
            active: true,
            currentWindow: true,
            url: "*://*.udemy.com/*/learn/lecture/*"
        }, buildAnalyzer);
    }


}

popupOpen();
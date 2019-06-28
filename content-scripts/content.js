"use strict";

(function () {
    /**
     * This script should only run once.
     */
    if (window.hasRun)
        return;
    window.hasRun = true;
    console.log("Udemy Progress is starting ..");

    const browser = (function () {
        return window.msBrowser || window.browser || chrome || window.chrome;
    })();

    const selectors = {
        sectionPanel: 'div[data-purpose^="section-panel-"]',
        timeSpan: '[class^="curriculum-item-link--metadata--"] > span:nth-child(2)',
        lectureLiOfSection: '[class^="curriculum-item-link--curriculum-item--"]'
    };

    function mySleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    function showError(error, errorToShow) {
        console.log(error);
        browser.runtime.sendMessage({ status: "error", errorToShow });
    }

    /**
     * Returns minutes as int type.
     * @param {String} timeString 
     */
    function timeStringToInt(timeString) {
        var array = timeString.split(" ");

        /**
         * Example to this scenario : "8min"
         */
        if (array.length === 1) {
            return parseInt(array[0])
        } else if (array.length === 2) {
            /**
             * Example to this scenario : "8 min"
             * At other languages, there is gap between '8' and 'min'
             */
            if (isNaN(parseInt(array[1]))) {
                return parseInt(array[0]);
            } else {
                return parseInt(0) * 60 + parseInt(1);
            }
        } else if (array.length === 4) {
            return parseInt(array[0]) * 60 + parseInt(array[2])
        }

        console.log("timeString didnt achieve success: 0!");
        return 0;
    }

    function isLectureWatched(lecture) {
        return lecture.querySelector("input").hasAttribute("checked");
    }

    function getLectureLength(lecture) {
        var timeSpan = lecture.querySelector(selectors.timeSpan);
        if (!timeSpan) {
            timeSpan = { innerText: "" };
        }
        return timeStringToInt(timeSpan.innerText);
    }

    function isSectionExpanded(section) {
        return section.getAttribute("aria-expanded") == "true";
    }

    async function analyzeCourse(callback) {
        console.log("Analyzation is started.");

        var status = "analyzing";
        var totalTime = 0;
        var watchTime = 0;
        var totalLectures = 0;
        var finishedLectures = 0;
        var sectionCount = 0;

        var isHalted = false;
        analyzeCourse.halt = function () {
            isHalted = true;
            status = "halted";
            if (typeof callback === "function")
                callback({ status, totalTime, watchTime, totalLectures, finishedLectures, sectionCount });

            console.log("operation is halted!");
        }

        var sectionPanels = document.querySelectorAll(selectors.sectionPanel);
        if (!sectionPanels) {
            showError("sectionPanels is falsey!",
                "Error: Cannot load sections! Refreshing may help.");
            return;
        }

        for (var section of sectionPanels) {
            sectionCount++;
            // to store if the section expanded before analyzation
            var isExpanded = isSectionExpanded(section);

            /**
             * If section is not expanded already, we need to click 
             * onto header of the section and wait for dom to load.
             */
            if (!isExpanded) {
                section.querySelector("div").click();
            }

            /**
             * Lectures are list-items.
             */
            var lectures = section.querySelectorAll(selectors.lectureLiOfSection);
            // if the section is not expanded yet or dom is not loaded after expanding,
            // lectures will be undefined.
            while (!lectures) {
                console.log("lecture are empty !!!");
                // This means the section is not clicked
                if (isExpanded !== isSectionExpanded(section)) {
                    section.querySelector("div").click();
                }
                await mySleep(50);
                lectures = section.querySelectorAll(selectors.lectureLiOfSection);
            }

            for (var lecture of lectures) {
                if (isHalted)
                    return;

                var lecLength = getLectureLength(lecture);

                totalTime += lecLength;
                if (isLectureWatched(lecture)) {
                    watchTime += lecLength;
                    finishedLectures++;
                }
                totalLectures++;

            }

            callback({ status, totalTime, watchTime, totalLectures, finishedLectures, sectionCount });

            /**
             * If section is not expanded at the beginning, we should reverse it
             */
            if (!isExpanded) {
                section.querySelector("div").click();
            }
        }

        if (isHalted)
            return;

        status = "completed";

        callback({ status, totalTime, watchTime, totalLectures, finishedLectures, sectionCount });
        console.log("Analyzation is completed.");
    }

    browser.runtime.onMessage.addListener(function (message) {
        switch (message.command) {
            case "alert":
                window.alert("alert from button");
                break;
            case "analyze":
                analyzeCourse(function (report) {
                    report.code = "analyzeResult";
                    browser.runtime.sendMessage(report);
                }).catch(console.log);
                break;
            case "halt":
                analyzeCourse.halt();
                break;
            case "popupLog":
                console.log(`popup log : ${message.log}`);
            default:
                break;
        }
    });

    console.log("Udemy Progress is ready.");
})();
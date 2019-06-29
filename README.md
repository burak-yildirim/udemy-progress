## Udemy Progress
A simple extension which calculates your progress on udemy course. 
Written by WebExtension API standarts and expected to work on most of common browsers.
Tested with Opera 62.0.3331.18, Vivaldi 2.6.1566.44 and Firefox 67.0.4. 

### Why 
Because udemy's progress feature is terrible, it calculates your progress simply
by the count of lectures you've watched / total. 40 minutes lecture and 1 minute lecture are not SAME.
Plus I am bored :)

### How
It is activated only on your course page and read data from the page. Since not all the lectures are 
loaded on DOM, It needs to do some clicks. Don't worry, it will still take only couple of seconds.
It does not save any data so your progress needs to be calculated everytime.

NOTE: It reads data from lectures's tags, and those lengths are given approximate by udemy
(for example for 1min 42sec long lecture, it is written 2min).

### Download
*[For Firefox](https://addons.mozilla.org/en-US/firefox/addon/udemy-progress/)
*[For Chrome-like Browsers](chromelike-download/udemy-progress.crx)

For chrome-like browsers, you need to add the extension manually. Simply open your browser's
extensions page and drag the '.crx' file on.

### Sample Pictures

Sample valid URL:
![Sample valid URL](images/valid-url.png)

While analyzing:
![While analyzing](images/analyzing.png)

Sample non-valid URL
![Sample non-valid URL](images/non-valid-url.png)
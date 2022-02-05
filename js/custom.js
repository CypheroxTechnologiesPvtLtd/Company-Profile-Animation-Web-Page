//// Main site configuration. ////
const configuration = {
  SiteName: 'CYPHEROX',
  Use2DTextOver3D: false, // Change to true if you want 2D over 3D
  SiteNameSize: 0.5, // Between 0 and +
  NumberOfVerticalLines: 1,
  NumberOfDots: 5000,
  colors: {
    CanvasBackgroundColor: '#141414',
    LettersColor: '#FEE71F',
    LinesColors: ['#FFF', '#8a772a', '#dfdfdf'],
    LowerLinesColors: ['#3d3d3d'],
    DotsColor: '#dfdfdf'
  }
}
///////////////////////////////


//import Slider from '../js-lib/slider.js'

const uiWrapper = document.querySelector('.ui-wrapper')

let constructorCb = null

let followElements = []
let followElementsPositions = []

let videoElementSource = ''
let slider = null
let popup = null


// UI js code start 


class Slider {
  constructor (sliderElement, leftArrowElement, rightArrowElement) {
    this.sliderElement = sliderElement
    this.leftArrow = leftArrowElement
    this.rightArrow = rightArrowElement

    this.slideIndex = 0
    this.sliderElementsCount = sliderElement.childElementCount

    this.rightArrow.addEventListener('click', this.moveLeft.bind(this))
    this.leftArrow.addEventListener('click', this.moveRight.bind(this))

    for (let index = 0; index < this.sliderElementsCount; index++) {
      const singleSliderElement = sliderElement.children[index]
      const sliderElementImage = singleSliderElement.querySelector('.slider__item-image')
      sliderElementImage.style.transitionDelay = `${400 + index * 50}ms`
    }
  }

  moveLeft () {
    this.leftArrow.classList.remove('slider__arrow--disabled')
    const numberOfVisibleElements = 4
    if (this.slideIndex === this.sliderElementsCount - numberOfVisibleElements - 1) this.rightArrow.classList.add('slider__arrow--disabled')
    if (this.slideIndex === this.sliderElementsCount - numberOfVisibleElements) return

    this.slideIndex ++
    this.sliderElement.style.left = `-${this.slideIndex * 25}%`
  }

  moveRight () {
    this.rightArrow.classList.remove('slider__arrow--disabled')
    if (this.slideIndex === 1) this.leftArrow.classList.add('slider__arrow--disabled')
    if (this.slideIndex === 0) return

    this.slideIndex --
    this.sliderElement.style.left = `-${this.slideIndex * 25}%`
  }

  destroy () {
    this.sliderElement.removeAttribute('style')
    this.rightArrow.classList.remove('slider__arrow--disabled')
    this.leftArrow.classList.add('slider__arrow--disabled')
    this.rightArrow.removeEventListener('click', this.moveLeft.bind(this))
    this.leftArrow.removeEventListener('click', this.moveRight.bind(this))
  }
}

class UI {
  constructor (callback) {
    constructorCb = callback
    
    followElements = uiWrapper.querySelectorAll('[data-follow]')
    this.getFollowElementsPosition()

    const events = [
      { selector: '.burger', cb: this.toggleMenu },
      { selector: '.fixed-content-header__contact', cb: this.onPagingClick.bind(this) },
      { selector: '#service_btn', cb: this.onPagingClick.bind(this) },
      { selector: '#sales_id', cb: this.onPagingClick.bind(this) },
      { selector: '#cash_id', cb: this.onPagingClick.bind(this) },
      { selector: '#bad_debt_id', cb: this.onPagingClick.bind(this) },
      { selector: '#management_id', cb: this.onPagingClick.bind(this) },
      { selector: '.fixed-content-paging', cb: this.onPagingClick.bind(this) },
      { selector: '.menu-list', cb: this.onMenuPagingClick.bind(this) },
      { selector: '#button_video', cb: this.showPopup.bind(this, 'video', this.initVideo, this.destoryVideo) },
      //{ selector: '#button_offers', cb: this.showPopup.bind(this, 'offers') },
      { selector: '#button_team', cb: this.showPopup.bind(this, 'team', this.initSlider, this.destroySlider) }
    ]
    events.forEach(event => {
      const element = uiWrapper.querySelector(event.selector)
      element.addEventListener('click', event.cb)
    })

    const footerYear = uiWrapper.querySelector('.footer-copy__date')
    footerYear.innerHTML = `© ${new Date().getFullYear()}`
  }



  ui_moveEvent (e, Use2DTextOver3D) {
    this.buttonMoveAnimation(e)
    if (Use2DTextOver3D) {
      this.mainLetters2DAnimation(e)
    }
  }

  buttonMoveAnimation (e) {
    const mouseLeft = e.clientX
    const mouseTop = e.clientY
    let elementAlreadyCentered = { y: false }
    followElements.forEach((element, index) => {
      const elementPositions = followElementsPositions[index]
      // If cursor is close to the button element then move the button closer to the cursor;
      if (mouseLeft > elementPositions.left - 100 && mouseLeft < elementPositions.right + 100 && 
          mouseTop > elementPositions.top - 100 && mouseTop < elementPositions.bottom + 100) {
        const moveX = (elementPositions.left - mouseLeft) / 10
        const moveY = (elementPositions.top - mouseTop) / 10

        // If moved element already has some kind of centering set, add that position to calc;
        elementAlreadyCentered.y = false
        if (element.dataset.follow === 'centered_y') {
          elementAlreadyCentered.y = true
        }

        element.style.transform = `translate3d(${-moveX}px, calc(${elementAlreadyCentered.y ? -50 : 0}% + ${-moveY}px), 0)`
        element.style.transition = ''
      } else {
        element.style.transform = ``
        element.style.transition = 'transform 500ms ease'
      }
    })
  }

  mainLetters2DAnimation (e) {
    const letters = document.querySelector('.configuration__letters')
    
    const xCenter = window.innerWidth / 2
    const yCenter = window.innerHeight / 2
    const LettersXPosition = xCenter - e.clientX
    const LettersYPosition = yCenter - e.clientY
    letters.style.transform = `rotateX(${-LettersXPosition / 50}deg) rotateY(${LettersYPosition / 50}deg) translateX(-50%)`
  }

  showPopup (popupType, createCallback, destroyCallback) {
    if (typeof createCallback === 'function') createCallback() 
    popup = uiWrapper.querySelector(`[data-popup=${popupType}]`)
    popup.classList.add('popup--active')
    // First remove display: none, then add animated class;
    setTimeout(() => {
      popup.classList.add('popup--animated')
      popup.addEventListener('click', this.hidePopup)
      // Add parameter to prototype, so listener can be removed;
      popup._eventParameter = destroyCallback
      constructorCb().blockSceneScrolling(true)
      this.getFollowElementsPosition()
    }, 0)
  }

  hidePopup (event) {
    if (event.target !== event.currentTarget) return
    popup.classList.remove('popup--active')
    popup.classList.remove('popup--animated')
    popup.removeEventListener('click', this.hidePopup)
    constructorCb().blockSceneScrolling(false)
    if (typeof popup._eventParameter === 'function') popup._eventParameter()
  }

  initSlider () {
    const sliderElement = uiWrapper.querySelector('#slider')
    const leftArrow = uiWrapper.querySelector('.slider__arrow-left')
    const rightArrow = uiWrapper.querySelector('.slider__arrow-right')
    slider = new Slider(sliderElement, leftArrow, rightArrow)
  }

  destroySlider () {
    slider.destroy()
    slider = null
  }

  initVideo () {
    if (!videoElementSource) return
    const videoElement = document.querySelector('#video')
    videoElement.setAttribute('src', videoElementSource)
  }

  destoryVideo () {
    const videoElement = document.querySelector('#video')
    videoElementSource = videoElement.src
    // Remove src tag, because you can't stop video while in iFrame;
    videoElement.removeAttribute('src')
  }

  toggleMenu () {
    uiWrapper.classList.toggle('menu-opened')
    uiWrapper.querySelector('.burger').classList.toggle('burger--active')
  }

  ui_moveScene (direction) {
    this.checkContentVisibility(direction)
  }

  onMenuPagingClick (e) {
    this.toggleMenu()
    this.onPagingClick(e)
  }

  onPagingClick (e) {
    const datasetPage = +e.target.dataset.page
    if (datasetPage >= 0) {
      constructorCb().onPagingClick(datasetPage)
    }
  }

  getFollowElementsPosition () {
    followElementsPositions = []
    followElements.forEach(element => followElementsPositions.push(element.getBoundingClientRect()))
  }

  checkContentVisibility (direction) {
    const contentSections = uiWrapper.querySelectorAll('[data-page]')
    const animateSection = section => {
      // Add different class depending on scroll direction.
      if (direction === 'down')  {
        section.classList.add('section--hidden')
        section.classList.remove('section--hidden-reverse')
      } else {
        section.classList.add('section--hidden-reverse')
        section.classList.remove('section--hidden')
      }

      if (+section.dataset.page === constructorCb().getCurrentPage()) {
        section.style.display = 'flex'
        const removeClass = () => section.classList.remove('section--hidden', 'section--hidden-reverse')
        window.requestAnimationFrame(() => {
          window.requestAnimationFrame(removeClass)
        })
      }
    }

    // For each section first hide them all then show active.
    contentSections.forEach(section => {
      // Set low opacity on section that is leaving.
      // Transition is set in (main.css).
      section.style.opacity = '0'
      // Set timeout for the transition to end.
      setTimeout(() => {
        // Remove style tag with opacity and display property.
        section.removeAttribute('style')
        animateSection(section)
      }, 300)
    })
  }
}


// UI js code start end

// // Import all needed dependencies.
// import * as THREE from '../js-lib/three.module.min.js'
// import TWEEN from '../js-lib/tween.js'
// import UI from '../js-lib/ui.js'

// Initialize UI thread. All UI scripting should be done
// in this instance.
const ui = new UI(uiCallback)

const windowHeightInRadians = 25
let camera, scene, renderer
let sceneMovedAmmount = 0
let timeoutActive = false

const mainGeomertries = []
let mainLettersMesh

let touchStartPosition

// Wait for page to load
window.addEventListener('load', () => {
  const uiWrapper = document.querySelector('.ui-wrapper')
  uiWrapper.classList.remove('page-not-loaded')
  // Loading animation lasts for 3s;
  setTimeout(() => {
    init()
    animate()
  }, 3000)
});


// Tween Max Js Code start

var NOW;
// Include a performance.now polyfill.
// In node.js, use process.hrtime.
// eslint-disable-next-line
// @ts-ignore
if (typeof self === 'undefined' && typeof process !== 'undefined' && process.hrtime) {
    NOW = function () {
        // eslint-disable-next-line
        // @ts-ignore
        var time = process.hrtime();
        // Convert [seconds, nanoseconds] to milliseconds.
        return time[0] * 1000 + time[1] / 1000000;
    };
}
// In a browser, use self.performance.now if it is available.
else if (typeof self !== 'undefined' && self.performance !== undefined && self.performance.now !== undefined) {
    // This must be bound, because directly assigning this function
    // leads to an invocation exception in Chrome.
    NOW = self.performance.now.bind(self.performance);
}
// Use Date.now if it is available.
else if (Date.now !== undefined) {
    NOW = Date.now;
}
// Otherwise, use 'new Date().getTime()'.
else {
    NOW = function () {
        return new Date().getTime();
    };
}





var NOW$1 = NOW;

/**
 * Controlling groups of tweens
 *
 * Using the TWEEN singleton to manage your tweens can cause issues in large apps with many components.
 * In these cases, you may want to create your own smaller groups of tween
 */
var Group = /** @class */ (function () {
    function Group() {
        this._tweens = {};
        this._tweensAddedDuringUpdate = {};
    }
    Group.prototype.getAll = function () {
        var _this = this;
        return Object.keys(this._tweens).map(function (tweenId) {
            return _this._tweens[tweenId];
        });
    };
    Group.prototype.removeAll = function () {
        this._tweens = {};
    };
    Group.prototype.add = function (tween) {
        this._tweens[tween.getId()] = tween;
        this._tweensAddedDuringUpdate[tween.getId()] = tween;
    };
    Group.prototype.remove = function (tween) {
        delete this._tweens[tween.getId()];
        delete this._tweensAddedDuringUpdate[tween.getId()];
    };
    Group.prototype.update = function (time, preserve) {
        var tweenIds = Object.keys(this._tweens);
        if (tweenIds.length === 0) {
            return false;
        }
        time = time !== undefined ? time : NOW$1();
        // Tweens are updated in "batches". If you add a new tween during an
        // update, then the new tween will be updated in the next batch.
        // If you remove a tween during an update, it may or may not be updated.
        // However, if the removed tween was added during the current batch,
        // then it will not be updated.
        while (tweenIds.length > 0) {
            this._tweensAddedDuringUpdate = {};
            for (var i = 0; i < tweenIds.length; i++) {
                var tween = this._tweens[tweenIds[i]];
                if (tween && tween.update(time) === false && !preserve) {
                    delete this._tweens[tweenIds[i]];
                }
            }
            tweenIds = Object.keys(this._tweensAddedDuringUpdate);
        }
        return true;
    };
    return Group;
}());

/**
 * The Ease class provides a collection of easing functions for use with tween.js.
 */
var Easing = {
    Linear: {
        None: function (amount) {
            return amount;
        },
    },
    Quadratic: {
        In: function (amount) {
            return amount * amount;
        },
        Out: function (amount) {
            return amount * (2 - amount);
        },
        InOut: function (amount) {
            if ((amount *= 2) < 1) {
                return 0.5 * amount * amount;
            }
            return -0.5 * (--amount * (amount - 2) - 1);
        },
    },
    Cubic: {
        In: function (amount) {
            return amount * amount * amount;
        },
        Out: function (amount) {
            return --amount * amount * amount + 1;
        },
        InOut: function (amount) {
            if ((amount *= 2) < 1) {
                return 0.5 * amount * amount * amount;
            }
            return 0.5 * ((amount -= 2) * amount * amount + 2);
        },
    },
    Quartic: {
        In: function (amount) {
            return amount * amount * amount * amount;
        },
        Out: function (amount) {
            return 1 - --amount * amount * amount * amount;
        },
        InOut: function (amount) {
            if ((amount *= 2) < 1) {
                return 0.5 * amount * amount * amount * amount;
            }
            return -0.5 * ((amount -= 2) * amount * amount * amount - 2);
        },
    },
    Quintic: {
        In: function (amount) {
            return amount * amount * amount * amount * amount;
        },
        Out: function (amount) {
            return --amount * amount * amount * amount * amount + 1;
        },
        InOut: function (amount) {
            if ((amount *= 2) < 1) {
                return 0.5 * amount * amount * amount * amount * amount;
            }
            return 0.5 * ((amount -= 2) * amount * amount * amount * amount + 2);
        },
    },
    Sinusoidal: {
        In: function (amount) {
            return 1 - Math.cos((amount * Math.PI) / 2);
        },
        Out: function (amount) {
            return Math.sin((amount * Math.PI) / 2);
        },
        InOut: function (amount) {
            return 0.5 * (1 - Math.cos(Math.PI * amount));
        },
    },
    Exponential: {
        In: function (amount) {
            return amount === 0 ? 0 : Math.pow(1024, amount - 1);
        },
        Out: function (amount) {
            return amount === 1 ? 1 : 1 - Math.pow(2, -10 * amount);
        },
        InOut: function (amount) {
            if (amount === 0) {
                return 0;
            }
            if (amount === 1) {
                return 1;
            }
            if ((amount *= 2) < 1) {
                return 0.5 * Math.pow(1024, amount - 1);
            }
            return 0.5 * (-Math.pow(2, -10 * (amount - 1)) + 2);
        },
    },
    Circular: {
        In: function (amount) {
            return 1 - Math.sqrt(1 - amount * amount);
        },
        Out: function (amount) {
            return Math.sqrt(1 - --amount * amount);
        },
        InOut: function (amount) {
            if ((amount *= 2) < 1) {
                return -0.5 * (Math.sqrt(1 - amount * amount) - 1);
            }
            return 0.5 * (Math.sqrt(1 - (amount -= 2) * amount) + 1);
        },
    },
    Elastic: {
        In: function (amount) {
            if (amount === 0) {
                return 0;
            }
            if (amount === 1) {
                return 1;
            }
            return -Math.pow(2, 10 * (amount - 1)) * Math.sin((amount - 1.1) * 5 * Math.PI);
        },
        Out: function (amount) {
            if (amount === 0) {
                return 0;
            }
            if (amount === 1) {
                return 1;
            }
            return Math.pow(2, -10 * amount) * Math.sin((amount - 0.1) * 5 * Math.PI) + 1;
        },
        InOut: function (amount) {
            if (amount === 0) {
                return 0;
            }
            if (amount === 1) {
                return 1;
            }
            amount *= 2;
            if (amount < 1) {
                return -0.5 * Math.pow(2, 10 * (amount - 1)) * Math.sin((amount - 1.1) * 5 * Math.PI);
            }
            return 0.5 * Math.pow(2, -10 * (amount - 1)) * Math.sin((amount - 1.1) * 5 * Math.PI) + 1;
        },
    },
    Back: {
        In: function (amount) {
            var s = 1.70158;
            return amount * amount * ((s + 1) * amount - s);
        },
        Out: function (amount) {
            var s = 1.70158;
            return --amount * amount * ((s + 1) * amount + s) + 1;
        },
        InOut: function (amount) {
            var s = 1.70158 * 1.525;
            if ((amount *= 2) < 1) {
                return 0.5 * (amount * amount * ((s + 1) * amount - s));
            }
            return 0.5 * ((amount -= 2) * amount * ((s + 1) * amount + s) + 2);
        },
    },
    Bounce: {
        In: function (amount) {
            return 1 - Easing.Bounce.Out(1 - amount);
        },
        Out: function (amount) {
            if (amount < 1 / 2.75) {
                return 7.5625 * amount * amount;
            }
            else if (amount < 2 / 2.75) {
                return 7.5625 * (amount -= 1.5 / 2.75) * amount + 0.75;
            }
            else if (amount < 2.5 / 2.75) {
                return 7.5625 * (amount -= 2.25 / 2.75) * amount + 0.9375;
            }
            else {
                return 7.5625 * (amount -= 2.625 / 2.75) * amount + 0.984375;
            }
        },
        InOut: function (amount) {
            if (amount < 0.5) {
                return Easing.Bounce.In(amount * 2) * 0.5;
            }
            return Easing.Bounce.Out(amount * 2 - 1) * 0.5 + 0.5;
        },
    },
};

/**
 *
 */
var Interpolation = {
    Linear: function (v, k) {
        var m = v.length - 1;
        var f = m * k;
        var i = Math.floor(f);
        var fn = Interpolation.Utils.Linear;
        if (k < 0) {
            return fn(v[0], v[1], f);
        }
        if (k > 1) {
            return fn(v[m], v[m - 1], m - f);
        }
        return fn(v[i], v[i + 1 > m ? m : i + 1], f - i);
    },
    Bezier: function (v, k) {
        var b = 0;
        var n = v.length - 1;
        var pw = Math.pow;
        var bn = Interpolation.Utils.Bernstein;
        for (var i = 0; i <= n; i++) {
            b += pw(1 - k, n - i) * pw(k, i) * v[i] * bn(n, i);
        }
        return b;
    },
    CatmullRom: function (v, k) {
        var m = v.length - 1;
        var f = m * k;
        var i = Math.floor(f);
        var fn = Interpolation.Utils.CatmullRom;
        if (v[0] === v[m]) {
            if (k < 0) {
                i = Math.floor((f = m * (1 + k)));
            }
            return fn(v[(i - 1 + m) % m], v[i], v[(i + 1) % m], v[(i + 2) % m], f - i);
        }
        else {
            if (k < 0) {
                return v[0] - (fn(v[0], v[0], v[1], v[1], -f) - v[0]);
            }
            if (k > 1) {
                return v[m] - (fn(v[m], v[m], v[m - 1], v[m - 1], f - m) - v[m]);
            }
            return fn(v[i ? i - 1 : 0], v[i], v[m < i + 1 ? m : i + 1], v[m < i + 2 ? m : i + 2], f - i);
        }
    },
    Utils: {
        Linear: function (p0, p1, t) {
            return (p1 - p0) * t + p0;
        },
        Bernstein: function (n, i) {
            var fc = Interpolation.Utils.Factorial;
            return fc(n) / fc(i) / fc(n - i);
        },
        Factorial: (function () {
            var a = [1];
            return function (n) {
                var s = 1;
                if (a[n]) {
                    return a[n];
                }
                for (var i = n; i > 1; i--) {
                    s *= i;
                }
                a[n] = s;
                return s;
            };
        })(),
        CatmullRom: function (p0, p1, p2, p3, t) {
            var v0 = (p2 - p0) * 0.5;
            var v1 = (p3 - p1) * 0.5;
            var t2 = t * t;
            var t3 = t * t2;
            return (2 * p1 - 2 * p2 + v0 + v1) * t3 + (-3 * p1 + 3 * p2 - 2 * v0 - v1) * t2 + v0 * t + p1;
        },
    },
};

/**
 * Utils
 */
var Sequence = /** @class */ (function () {
    function Sequence() {
    }
    Sequence.nextId = function () {
        return Sequence._nextId++;
    };
    Sequence._nextId = 0;
    return Sequence;
}());

/**
 * Tween.js - Licensed under the MIT license
 * https://github.com/tweenjs/tween.js
 * ----------------------------------------------
 *
 * See https://github.com/tweenjs/tween.js/graphs/contributors for the full list of contributors.
 * Thank you all, you're awesome!
 */
var Tween = /** @class */ (function () {
    function Tween(_object, _group) {
        if (_group === void 0) { _group = TWEEN; }
        this._object = _object;
        this._group = _group;
        this._isPaused = false;
        this._pauseStart = 0;
        this._valuesStart = {};
        this._valuesEnd = {};
        this._valuesStartRepeat = {};
        this._duration = 1000;
        this._initialRepeat = 0;
        this._repeat = 0;
        this._yoyo = false;
        this._isPlaying = false;
        this._reversed = false;
        this._delayTime = 0;
        this._startTime = 0;
        this._easingFunction = TWEEN.Easing.Linear.None;
        this._interpolationFunction = TWEEN.Interpolation.Linear;
        this._chainedTweens = [];
        this._onStartCallbackFired = false;
        this._id = TWEEN.nextId();
        this._isChainStopped = false;
    }
    Tween.prototype.getId = function () {
        return this._id;
    };
    Tween.prototype.isPlaying = function () {
        return this._isPlaying;
    };
    Tween.prototype.isPaused = function () {
        return this._isPaused;
    };
    Tween.prototype.to = function (properties, duration) {
        // to (properties, duration) {
        for (var prop in properties) {
            this._valuesEnd[prop] = properties[prop];
        }
        if (duration !== undefined) {
            this._duration = duration;
        }
        return this;
    };
    Tween.prototype.duration = function (d) {
        this._duration = d;
        return this;
    };
    Tween.prototype.start = function (time) {
        if (this._isPlaying) {
            return this;
        }
        // eslint-disable-next-line
        // @ts-ignore FIXME?
        this._group.add(this);
        this._repeat = this._initialRepeat;
        if (this._reversed) {
            // If we were reversed (f.e. using the yoyo feature) then we need to
            // flip the tween direction back to forward.
            this._reversed = false;
            for (var property in this._valuesStartRepeat) {
                this._swapEndStartRepeatValues(property);
                this._valuesStart[property] = this._valuesStartRepeat[property];
            }
        }
        this._isPlaying = true;
        this._isPaused = false;
        this._onStartCallbackFired = false;
        this._isChainStopped = false;
        this._startTime =
            time !== undefined ? (typeof time === 'string' ? TWEEN.now() + parseFloat(time) : time) : TWEEN.now();
        this._startTime += this._delayTime;
        this._setupProperties(this._object, this._valuesStart, this._valuesEnd, this._valuesStartRepeat);
        return this;
    };
    Tween.prototype._setupProperties = function (_object, _valuesStart, _valuesEnd, _valuesStartRepeat) {
        for (var property in _valuesEnd) {
            var startValue = _object[property];
            var startValueIsArray = Array.isArray(startValue);
            var propType = startValueIsArray ? 'array' : typeof startValue;
            var isInterpolationList = !startValueIsArray && Array.isArray(_valuesEnd[property]);
            // If `to()` specifies a property that doesn't exist in the source object,
            // we should not set that property in the object
            if (propType === 'undefined' || propType === 'function') {
                continue;
            }
            // Check if an Array was provided as property value
            if (isInterpolationList) {
                var endValues = _valuesEnd[property];
                if (endValues.length === 0) {
                    continue;
                }
                // handle an array of relative values
                endValues = endValues.map(this._handleRelativeValue.bind(this, startValue));
                // Create a local copy of the Array with the start value at the front
                _valuesEnd[property] = [startValue].concat(endValues);
            }
            // handle the deepness of the values
            if ((propType === 'object' || startValueIsArray) && startValue && !isInterpolationList) {
                _valuesStart[property] = startValueIsArray ? [] : {};
                // eslint-disable-next-line
                for (var prop in startValue) {
                    // eslint-disable-next-line
                    // @ts-ignore FIXME?
                    _valuesStart[property][prop] = startValue[prop];
                }
                _valuesStartRepeat[property] = startValueIsArray ? [] : {}; // TODO? repeat nested values? And yoyo? And array values?
                // eslint-disable-next-line
                // @ts-ignore FIXME?
                this._setupProperties(startValue, _valuesStart[property], _valuesEnd[property], _valuesStartRepeat[property]);
            }
            else {
                // Save the starting value, but only once.
                if (typeof _valuesStart[property] === 'undefined') {
                    _valuesStart[property] = startValue;
                }
                if (!startValueIsArray) {
                    // eslint-disable-next-line
                    // @ts-ignore FIXME?
                    _valuesStart[property] *= 1.0; // Ensures we're using numbers, not strings
                }
                if (isInterpolationList) {
                    // eslint-disable-next-line
                    // @ts-ignore FIXME?
                    _valuesStartRepeat[property] = _valuesEnd[property].slice().reverse();
                }
                else {
                    _valuesStartRepeat[property] = _valuesStart[property] || 0;
                }
            }
        }
    };
    Tween.prototype.stop = function () {
        if (!this._isChainStopped) {
            this._isChainStopped = true;
            this.stopChainedTweens();
        }
        if (!this._isPlaying) {
            return this;
        }
        // eslint-disable-next-line
        // @ts-ignore FIXME?
        this._group.remove(this);
        this._isPlaying = false;
        this._isPaused = false;
        if (this._onStopCallback) {
            this._onStopCallback(this._object);
        }
        return this;
    };
    Tween.prototype.end = function () {
        this.update(Infinity);
        return this;
    };
    Tween.prototype.pause = function (time) {
        if (this._isPaused || !this._isPlaying) {
            return this;
        }
        this._isPaused = true;
        this._pauseStart = time === undefined ? TWEEN.now() : time;
        // eslint-disable-next-line
        // @ts-ignore FIXME?
        this._group.remove(this);
        return this;
    };
    Tween.prototype.resume = function (time) {
        if (!this._isPaused || !this._isPlaying) {
            return this;
        }
        this._isPaused = false;
        this._startTime += (time === undefined ? TWEEN.now() : time) - this._pauseStart;
        this._pauseStart = 0;
        // eslint-disable-next-line
        // @ts-ignore FIXME?
        this._group.add(this);
        return this;
    };
    Tween.prototype.stopChainedTweens = function () {
        for (var i = 0, numChainedTweens = this._chainedTweens.length; i < numChainedTweens; i++) {
            this._chainedTweens[i].stop();
        }
        return this;
    };
    Tween.prototype.group = function (group) {
        this._group = group;
        return this;
    };
    Tween.prototype.delay = function (amount) {
        this._delayTime = amount;
        return this;
    };
    Tween.prototype.repeat = function (times) {
        this._initialRepeat = times;
        this._repeat = times;
        return this;
    };
    Tween.prototype.repeatDelay = function (amount) {
        this._repeatDelayTime = amount;
        return this;
    };
    Tween.prototype.yoyo = function (yoyo) {
        this._yoyo = yoyo;
        return this;
    };
    Tween.prototype.easing = function (easingFunction) {
        this._easingFunction = easingFunction;
        return this;
    };
    Tween.prototype.interpolation = function (interpolationFunction) {
        this._interpolationFunction = interpolationFunction;
        return this;
    };
    Tween.prototype.chain = function () {
        var tweens = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            tweens[_i] = arguments[_i];
        }
        this._chainedTweens = tweens;
        return this;
    };
    Tween.prototype.onStart = function (callback) {
        this._onStartCallback = callback;
        return this;
    };
    Tween.prototype.onUpdate = function (callback) {
        this._onUpdateCallback = callback;
        return this;
    };
    Tween.prototype.onRepeat = function (callback) {
        this._onRepeatCallback = callback;
        return this;
    };
    Tween.prototype.onComplete = function (callback) {
        this._onCompleteCallback = callback;
        return this;
    };
    Tween.prototype.onStop = function (callback) {
        this._onStopCallback = callback;
        return this;
    };
    Tween.prototype.update = function (time) {
        var property;
        var elapsed;
        var endTime = this._startTime + this._duration;
        if (time > endTime && !this._isPlaying) {
            return false;
        }
        // If the tween was already finished,
        if (!this.isPlaying) {
            this.start(time);
        }
        if (time < this._startTime) {
            return true;
        }
        if (this._onStartCallbackFired === false) {
            if (this._onStartCallback) {
                this._onStartCallback(this._object);
            }
            this._onStartCallbackFired = true;
        }
        elapsed = (time - this._startTime) / this._duration;
        elapsed = this._duration === 0 || elapsed > 1 ? 1 : elapsed;
        var value = this._easingFunction(elapsed);
        // properties transformations
        this._updateProperties(this._object, this._valuesStart, this._valuesEnd, value);
        if (this._onUpdateCallback) {
            this._onUpdateCallback(this._object, elapsed);
        }
        if (elapsed === 1) {
            if (this._repeat > 0) {
                if (isFinite(this._repeat)) {
                    this._repeat--;
                }
                // Reassign starting values, restart by making startTime = now
                for (property in this._valuesStartRepeat) {
                    if (!this._yoyo && typeof this._valuesEnd[property] === 'string') {
                        this._valuesStartRepeat[property] =
                            // eslint-disable-next-line
                            // @ts-ignore FIXME?
                            this._valuesStartRepeat[property] + parseFloat(this._valuesEnd[property]);
                    }
                    if (this._yoyo) {
                        this._swapEndStartRepeatValues(property);
                    }
                    this._valuesStart[property] = this._valuesStartRepeat[property];
                }
                if (this._yoyo) {
                    this._reversed = !this._reversed;
                }
                if (this._repeatDelayTime !== undefined) {
                    this._startTime = time + this._repeatDelayTime;
                }
                else {
                    this._startTime = time + this._delayTime;
                }
                if (this._onRepeatCallback) {
                    this._onRepeatCallback(this._object);
                }
                return true;
            }
            else {
                if (this._onCompleteCallback) {
                    this._onCompleteCallback(this._object);
                }
                for (var i = 0, numChainedTweens = this._chainedTweens.length; i < numChainedTweens; i++) {
                    // Make the chained tweens start exactly at the time they should,
                    // even if the `update()` method was called way past the duration of the tween
                    this._chainedTweens[i].start(this._startTime + this._duration);
                }
                this._isPlaying = false;
                return false;
            }
        }
        return true;
    };
    Tween.prototype._updateProperties = function (_object, _valuesStart, _valuesEnd, value) {
        for (var property in _valuesEnd) {
            // Don't update properties that do not exist in the source object
            if (_valuesStart[property] === undefined) {
                continue;
            }
            var start = _valuesStart[property] || 0;
            var end = _valuesEnd[property];
            var startIsArray = Array.isArray(_object[property]);
            var endIsArray = Array.isArray(end);
            var isInterpolationList = !startIsArray && endIsArray;
            if (isInterpolationList) {
                _object[property] = this._interpolationFunction(end, value);
            }
            else if (typeof end === 'object' && end) {
                // eslint-disable-next-line
                // @ts-ignore FIXME?
                this._updateProperties(_object[property], start, end, value);
            }
            else {
                // Parses relative end values with start as base (e.g.: +10, -3)
                end = this._handleRelativeValue(start, end);
                // Protect against non numeric properties.
                if (typeof end === 'number') {
                    // eslint-disable-next-line
                    // @ts-ignore FIXME?
                    _object[property] = start + (end - start) * value;
                }
            }
        }
    };
    Tween.prototype._handleRelativeValue = function (start, end) {
        if (typeof end !== 'string') {
            return end;
        }
        if (end.charAt(0) === '+' || end.charAt(0) === '-') {
            return start + parseFloat(end);
        }
        else {
            return parseFloat(end);
        }
    };
    Tween.prototype._swapEndStartRepeatValues = function (property) {
        var tmp = this._valuesStartRepeat[property];
        if (typeof this._valuesEnd[property] === 'string') {
            // eslint-disable-next-line
            // @ts-ignore FIXME?
            this._valuesStartRepeat[property] = this._valuesStartRepeat[property] + parseFloat(this._valuesEnd[property]);
        }
        else {
            this._valuesStartRepeat[property] = this._valuesEnd[property];
        }
        this._valuesEnd[property] = tmp;
    };
    return Tween;
}());

var VERSION = '18.5.0';

/**
 * Tween.js - Licensed under the MIT license
 * https://github.com/tweenjs/tween.js
 * ----------------------------------------------
 *
 * See https://github.com/tweenjs/tween.js/graphs/contributors for the full list of contributors.
 * Thank you all, you're awesome!
 */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
/**
 * Controlling groups of tweens
 *
 * Using the TWEEN singleton to manage your tweens can cause issues in large apps with many components.
 * In these cases, you may want to create your own smaller groups of tween
 */
var Main = /** @class */ (function (_super) {
    __extends(Main, _super);
    function Main() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.version = VERSION;
        _this.now = NOW$1;
        _this.Group = Group;
        _this.Easing = Easing;
        _this.Interpolation = Interpolation;
        _this.nextId = Sequence.nextId;
        _this.Tween = Tween;
        return _this;
    }
    return Main;
}(Group));
var TWEEN = new Main();

 //export default TWEEN;


// Tween Max Js Code End



// Three js code start


function init() {
  camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 2, 20000)
  camera.position.z = 20

  scene = new THREE.Scene()
  scene.background = new THREE.Color(configuration.colors.CanvasBackgroundColor)
  const near = 10
  const far = 150
  scene.fog = new THREE.Fog(configuration.colors.CanvasBackgroundColor, near, far)

  // Load main letters and generate random lines.
  if (!configuration.Use2DTextOver3D) {
    loadMainLetters()
  } else {
    loadMain2DLetters()
  }
  for (let index = 0; index < configuration.NumberOfVerticalLines; index++) {
    generateRandomObject(1, [[0.2, 2, 4, 5], [0.1, 0.2]], configuration.colors.LinesColors)
    // Generate few random objects per page.
    generateRandomObject(-windowHeightInRadians * index / 3, [[2, 4], [0.05]], configuration.colors.LowerLinesColors)
  }

  renderer = new THREE.WebGLRenderer()
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(window.innerWidth, window.innerHeight)
  document.body.appendChild(renderer.domElement)

  // Add listeners.
  window.addEventListener('resize', windowResize, false)
  window.addEventListener('wheel', windowWheelOrTouch, false)
  window.addEventListener('touchstart', e => { touchStartPosition = e.touches[0].pageY }, false)
  window.addEventListener('touchmove', windowWheelOrTouch, false)
  if (!isMobile()) window.addEventListener('mousemove', mouseMove, false)
}

function animate (time) {
  requestAnimationFrame(animate)
  TWEEN.update()
  render(time)
}

function render (time) {
  time = time / 1000
  
  if (mainLettersMesh) mainLettersMesh.material.uniforms.time.value = time
  // Move geometries left and right.
  mainGeomertries.forEach((geometry, index) => {
    geometry.scale.x = Math.sin(time / 2 + index * 3) * 0.5 + 0.5
  })

  renderer.render(scene, camera)
}

// **** HELPER FUNCTIONS **** //

// Generate main geometries by random width, height, color and position.
function generateRandomObject (verticalPosition, availableSizes, availableColors) {
  const randomIntFromInterval = (min, max) => Math.floor(Math.random() * (max - min + 1) + min)

  const randomWidth = availableSizes[0][randomIntFromInterval(0, availableSizes[0].length - 1)]
  const randomHeight = availableSizes[1][randomIntFromInterval(0, availableSizes[1].length - 1)]
  const randomColor = availableColors[randomIntFromInterval(0, availableColors.length - 1)]

  const geometry = new THREE.PlaneBufferGeometry(randomWidth, randomHeight, 1)
  geometry.applyMatrix4(new THREE.Matrix4().makeTranslation(-geometry.parameters.width / 2, 0, 0 ))
  const material = new THREE.MeshBasicMaterial({ color: randomColor, side: THREE.FrontSide })
  const mesh = new THREE.Mesh(geometry, material)

  mesh.position.x = randomIntFromInterval(-10, 10)
  mesh.position.y = verticalPosition + randomIntFromInterval(-10, 10)
  mesh.position.z = randomIntFromInterval(-10, 10)

  scene.add(mesh)
  mainGeomertries.push(mesh)
}

function loadMainLetters () {
  const fontLoader = new THREE.FontLoader()
  fontLoader.load('fonts/Helvetica Condensed Black_Regular.json', font => {
    let textGeometry = new THREE.TextGeometry(configuration.SiteName, { font: font, size: 5, height: 3, curveSegments: 3 })
    textGeometry.center()

    textGeometry.scale(configuration.SiteNameSize, configuration.SiteNameSize, configuration.SiteNameSize)

    const textMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        color: { type: 'vec3', value: new THREE.Color( configuration.colors.LettersColor ) }
      },
      vertexShader: vertexShader(),
      fragmentShader: fragmentShader(),
      side: THREE.DoubleSide,
      wireframe: true
    })
    mainLettersMesh = new THREE.Mesh(textGeometry, textMaterial)
    scene.add(mainLettersMesh)

    let vertices = []
  
    for (let i = 0; i < configuration.NumberOfDots; i ++) {
      let x = Math.random() * 200 - 100
      let y = Math.random() * 200 - 100
      let z = Math.random() * 200 - 100
    
      vertices.push(x, y, z)
    }
    
    const bufferGeometry = new THREE.BufferGeometry()
    bufferGeometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
    const pointSprite = new THREE.TextureLoader().load('images/pointImg.png')
    const pointsMaterial = new THREE.PointsMaterial({color: configuration.colors.DotsColor, size: 0.5, map: pointSprite, transparent: true, alphaTest: 0.5})
    const points = new THREE.Points(bufferGeometry, pointsMaterial)
    scene.add(points)

    windowResize()
  })
}

function vertexShader () {
  return `
  varying vec2 vUv;
  uniform float time;
  
  vec3 mod289(vec3 x) {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
  }
  
  vec4 mod289(vec4 x) {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
  }
  
  vec4 permute(vec4 x) {
       return mod289(((x*34.0)+1.0)*x);
  }
  
  vec4 taylorInvSqrt(vec4 r)
  {
    return 1.79284291400159 - 0.85373472095314 * r;
  }
  
  float snoise(vec3 v) {
    const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
    const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
    
    // First corner
    vec3 i  = floor(v + dot(v, C.yyy) );
    vec3 x0 =   v - i + dot(i, C.xxx) ;
    
    // Other corners
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min( g.xyz, l.zxy );
    vec3 i2 = max( g.xyz, l.zxy );
  
    //   x0 = x0 - 0.0 + 0.0 * C.xxx;
    //   x1 = x0 - i1  + 1.0 * C.xxx;
    //   x2 = x0 - i2  + 2.0 * C.xxx;
    //   x3 = x0 - 1.0 + 3.0 * C.xxx;
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy; // 2.0*C.x = 1/3 = C.y
    vec3 x3 = x0 - D.yyy;      // -1.0+3.0*C.x = -0.5 = -D.y
    
    // Permutations
    i = mod289(i);
    vec4 p = permute( permute( permute(
               i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
             + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
             + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
             
    // Gradients: 7x7 points over a square, mapped onto an octahedron.
    // The ring size 17*17 = 289 is close to a multiple of 49 (49*6 = 294)
    float n_ = 0.142857142857; // 1.0/7.0
    vec3  ns = n_ * D.wyz - D.xzx;
  
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);  //  mod(p,7*7)
  
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)
  
    vec4 x = x_ *ns.x + ns.yyyy;
    vec4 y = y_ *ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
  
    vec4 b0 = vec4( x.xy, y.xy );
    vec4 b1 = vec4( x.zw, y.zw );
  
    //vec4 s0 = vec4(lessThan(b0,0.0))*2.0 - 1.0;
    //vec4 s1 = vec4(lessThan(b1,0.0))*2.0 - 1.0;
    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
  
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
  
    vec3 p0 = vec3(a0.xy,h.x);
    vec3 p1 = vec3(a0.zw,h.y);
    vec3 p2 = vec3(a1.xy,h.z);
    vec3 p3 = vec3(a1.zw,h.w);
    
    // Normalise gradients
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;
    
    // Mix final noise value
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1),
                                  dot(p2,x2), dot(p3,x3) ) );
  }
  
  void main() {
    vUv = uv;
  
    vec3 pos = position;
    float noiseFreq = 3.5;
    float noiseAmp = 0.15; 
    vec3 noisePos = vec3(pos.x * noiseFreq + time, pos.y, pos.z);
    pos.x += snoise(noisePos) * noiseAmp;
  
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.);
  }
  `
}

function fragmentShader () {
  return `
  uniform vec3 color;
  void main() {
    gl_FragColor = vec4(color, 1.0 );
  }
  `
}

function loadMain2DLetters () {
  const configurationLetters = document.querySelector('.configuration__letters')
  configurationLetters.classList.remove('configuration__letters--hidden')
}

function isMobile () {
  try {
    document.createEvent('touchEvent')
    return true
  } catch (err) { return false }
}

function uiCallback () {
  return {
    onPagingClick (pagingIndex) {
      if (sceneMovedAmmount > sceneMovedAmmount) ui.ui_moveScene('down')
      else ui.ui_moveScene('up')

      sceneMovedAmmount = pagingIndex
      moveScene()
    },
    getCurrentPage () {
      return sceneMovedAmmount
    },
    blockSceneScrolling (active) {
      active ? timeoutActive = true : timeoutActive = false
    }
  }
}

// **** EVENT FUNCTIONS **** //

function moveScene () {
  new TWEEN.Tween(scene.position)
  .to({x: scene.position.x, y: sceneMovedAmmount * windowHeightInRadians, z: scene.position.z}, 1000)
  .easing(TWEEN.Easing.Quartic.InOut)
  .start()
}

function windowResize () {
  if (mainLettersMesh) {
    const scaleAmmount = Math.min(window.innerWidth / 1100, 1)
    mainLettersMesh.scale.x = scaleAmmount
    mainLettersMesh.scale.y = scaleAmmount
  }
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()

  renderer.setSize(window.innerWidth, window.innerHeight)
}

function windowWheelOrTouch (e) {
  // Limit scrolling to scroll only once in N milliseconds.
  if (timeoutActive) return
  timeoutActive = true
  setTimeout(() => { timeoutActive = false }, 1500)

  if (e.deltaY > 0 || (e.touches && e.touches[0].pageY < touchStartPosition)) {
    if (sceneMovedAmmount === 10) return
    sceneMovedAmmount++
    sceneMovedAmmount = Math.min(sceneMovedAmmount, 10)
    moveScene()
    ui.ui_moveScene('down')
    return
  }

  if (sceneMovedAmmount === 0) return
  sceneMovedAmmount--
  sceneMovedAmmount = Math.max(sceneMovedAmmount, 0)
  moveScene()
  ui.ui_moveScene('up')
}

function mouseMove (e) {
  ui.ui_moveEvent(e, configuration.Use2DTextOver3D)
  if (sceneMovedAmmount > 0) return

  const xCenter = window.innerWidth / 2
  const yCenter = window.innerHeight / 2
  const CameraXPosition = xCenter - e.clientX
  const CameraYPosition = yCenter - e.clientY

  camera.position.x = -CameraXPosition / 100
  camera.position.y = CameraYPosition / 100
  camera.lookAt(scene.position)
}

// Three js code End



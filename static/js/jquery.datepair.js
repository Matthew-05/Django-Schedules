!function(){"use strict";var t=864e5,e=window.Zepto||window.jQuery;function i(t,e){var i=e||{};for(var s in t)s in i||(i[s]=t[s]);return i}function s(t,i){if(e)e(t).trigger(i);else{var s=document.createEvent("CustomEvent");s.initCustomEvent(i,!0,!0,{}),t.dispatchEvent(s)}}function n(t,i){return e?e(t).hasClass(i):t.classList.contains(i)}function a(t,s){this.dateDelta=null,this.timeDelta=null,this._defaults={startClass:"start",endClass:"end",timeClass:"time",dateClass:"date",defaultDateDelta:0,defaultTimeDelta:36e5,anchor:"start",parseTime:function(t){return e(t).timepicker("getTime")},updateTime:function(t,i){e(t).timepicker("setTime",i)},setMinTime:function(t,i){e(t).timepicker("option","minTime",i)},parseDate:function(t){return t.value&&e(t).datepicker("getDate")},updateDate:function(t,i){e(t).datepicker("update",i)}},this.container=t,this.settings=i(this._defaults,s),this.startDateInput=this.container.querySelector("."+this.settings.startClass+"."+this.settings.dateClass),this.endDateInput=this.container.querySelector("."+this.settings.endClass+"."+this.settings.dateClass),this.startTimeInput=this.container.querySelector("."+this.settings.startClass+"."+this.settings.timeClass),this.endTimeInput=this.container.querySelector("."+this.settings.endClass+"."+this.settings.timeClass),this.refresh(),this._bindChangeHandler()}a.prototype={constructor:a,option:function(t,e){if("object"==typeof t)this.settings=i(this.settings,t);else if("string"==typeof t&&void 0!==e)this.settings[t]=e;else if("string"==typeof t)return this.settings[t];this._updateEndMintime()},getTimeDiff:function(){var e=this.dateDelta+this.timeDelta;return!(e<0)||this.startDateInput&&this.endDateInput||(e+=t),e},refresh:function(){if(this.startDateInput&&this.startDateInput.value&&this.endDateInput&&this.endDateInput.value){var t=this.settings.parseDate(this.startDateInput),e=this.settings.parseDate(this.endDateInput);t&&e&&(this.dateDelta=e.getTime()-t.getTime())}if(this.startTimeInput&&this.startTimeInput.value&&this.endTimeInput&&this.endTimeInput.value){var i=this.settings.parseTime(this.startTimeInput),s=this.settings.parseTime(this.endTimeInput);i&&s&&(this.timeDelta=s.getTime()-i.getTime(),this._updateEndMintime())}},remove:function(){this._unbindChangeHandler()},_bindChangeHandler:function(){e?e(this.container).on("change.datepair",e.proxy(this.handleEvent,this)):this.container.addEventListener("change",this,!1)},_unbindChangeHandler:function(){e?e(this.container).off("change.datepair"):this.container.removeEventListener("change",this,!1)},handleEvent:function(t){this._unbindChangeHandler(),n(t.target,this.settings.dateClass)?""!=t.target.value?(this._dateChanged(t.target),this._timeChanged(t.target)):this.dateDelta=null:n(t.target,this.settings.timeClass)&&(""!=t.target.value?this._timeChanged(t.target):this.timeDelta=null),this._validateRanges(),this._updateEndMintime(),this._bindChangeHandler()},_dateChanged:function(e){if(this.startDateInput&&this.endDateInput){var i=this.settings.parseDate(this.startDateInput),s=this.settings.parseDate(this.endDateInput);if(i&&s)if(Math.abs(s.getFullYear()-i.getFullYear())>1e3)console.log("here");else if("start"==this.settings.anchor&&n(e,this.settings.startClass)){var a=new Date(i.getTime()+this.dateDelta);this.settings.updateDate(this.endDateInput,a)}else if("end"==this.settings.anchor&&n(e,this.settings.endClass)){a=new Date(s.getTime()-this.dateDelta);this.settings.updateDate(this.startDateInput,a)}else if(s<i){var h=n(e,this.settings.startClass)?this.endDateInput:this.startDateInput,r=this.settings.parseDate(e);this.dateDelta=0,this.settings.updateDate(h,r)}else this.dateDelta=s.getTime()-i.getTime();else if(null!==this.settings.defaultDateDelta){if(i){var l=new Date(i.getTime()+this.settings.defaultDateDelta*t);this.settings.updateDate(this.endDateInput,l)}else if(s){var u=new Date(s.getTime()-this.settings.defaultDateDelta*t);this.settings.updateDate(this.startDateInput,u)}this.dateDelta=this.settings.defaultDateDelta*t}else this.dateDelta=null}},_timeChanged:function(t){if(this.startTimeInput&&this.endTimeInput){var e=this.settings.parseTime(this.startTimeInput),i=this.settings.parseTime(this.endTimeInput);if(e&&i)if("start"==this.settings.anchor&&n(t,this.settings.startClass))i=this._setTimeAndReturn(this.endTimeInput,new Date(e.getTime()+this.timeDelta)),this._doMidnightRollover(e,i);else if("end"==this.settings.anchor&&n(t,this.settings.endClass))e=this._setTimeAndReturn(this.startTimeInput,new Date(i.getTime()-this.timeDelta)),this._doMidnightRollover(e,i);else{var s,a;if(this._doMidnightRollover(e,i),this.startDateInput&&this.endDateInput&&(s=this.settings.parseDate(this.startDateInput),a=this.settings.parseDate(this.endDateInput)),+s==+a&&i<e){var h=n(t,this.settings.endClass)?this.endTimeInput:this.startTimeInput,r=n(t,this.settings.startClass)?this.endTimeInput:this.startTimeInput,l=this.settings.parseTime(h);this.timeDelta=0,this.settings.updateTime(r,l)}else this.timeDelta=i.getTime()-e.getTime()}else null!==this.settings.defaultTimeDelta?(this.timeDelta=this.settings.defaultTimeDelta,e?(i=this._setTimeAndReturn(this.endTimeInput,new Date(e.getTime()+this.settings.defaultTimeDelta)),this._doMidnightRollover(e,i)):i&&(e=this._setTimeAndReturn(this.startTimeInput,new Date(i.getTime()-this.settings.defaultTimeDelta)),this._doMidnightRollover(e,i))):this.timeDelta=null}},_setTimeAndReturn:function(t,e){return this.settings.updateTime(t,e),this.settings.parseTime(t)},_doMidnightRollover:function(e,i){if(this.startDateInput&&this.endDateInput){var s=this.settings.parseDate(this.endDateInput),n=this.settings.parseDate(this.startDateInput),a=i.getTime()-e.getTime(),h=i<e?t:-864e5;null!==this.dateDelta&&this.dateDelta+this.timeDelta<=t&&this.dateDelta+a!=0&&(h>0||0!=this.dateDelta)&&(a>=0&&this.timeDelta<0||a<0&&this.timeDelta>=0)&&("start"==this.settings.anchor?(this.settings.updateDate(this.endDateInput,new Date(s.getTime()+h)),this._dateChanged(this.endDateInput)):"end"==this.settings.anchor&&(this.settings.updateDate(this.startDateInput,new Date(n.getTime()-h)),this._dateChanged(this.startDateInput))),this.timeDelta=a}},_updateEndMintime:function(){if("function"==typeof this.settings.setMinTime){var e=null;"start"==this.settings.anchor&&(!this.dateDelta||this.dateDelta<t||this.timeDelta&&this.dateDelta+this.timeDelta<t)&&(e=this.settings.parseTime(this.startTimeInput)),this.settings.setMinTime(this.endTimeInput,e)}},_validateRanges:function(){this.startTimeInput&&this.endTimeInput&&null===this.timeDelta||this.startDateInput&&this.endDateInput&&null===this.dateDelta?s(this.container,"rangeIncomplete"):!this.startDateInput||!this.endDateInput||this.dateDelta+this.timeDelta>=0?s(this.container,"rangeSelected"):s(this.container,"rangeError")}},function(t,e){t.Datepair=a}(window)}();
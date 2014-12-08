angular.module('CaseMilestonesTrackerApp.filters', [])

.filter('minutesToTimeString',function(){
    return function(input) {
        if (!angular.isNumber(input))
            return input;
            
        var days = Math.floor(input / 1440);
        var hours = Math.floor((input % 1440) / 60);
        var minutes = Math.floor((input % 1440) % 60);
        var timeString = '';
        if(days > 0) timeString += days + " d ";
        if(hours > 0) timeString += hours + " h ";
        if(minutes >= 0) timeString += minutes + " m ";
        return timeString;
    };
})
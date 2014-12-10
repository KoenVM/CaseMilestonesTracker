CaseMilestonesTrackerV1
=======================
Those using the service cloud console might know the component you can show in the left showing the time remaining for the next milestone.
That component unfortunatly only shows the "next-up" milestone.

This piece of VF/code allows to show all milestones in a clear way.
Per milestone, it shows a progressbar which clearly shows the status of the milestone and how much time is remaining or with how much time a milestone was breached.

Things to know when you want to use it:
* it's a visualforce page with a standard controller + extension on case so you can add it (for example) in the page layout of case or a custom highlight panel
* it (logically) expects the case to have an entitlement... (if there is no entitlement / milestones, nothing will show up)
* it automatically counts down every minute without having to refresh the page
* it takes into account business hours (if there are)

icons used:
* open milestone with time remaining : clock icon
* clock is paused : pause icon
* case is outside business hours : pause icon
* milestone is at 60% of time : eye-icon + orange
* at 80% : flame icon + red
* breached milestone : thumbs down + red
* completed (non-breached) milestone : thumbs up + green

it's possible to complete open milestones with the tick icon at the left

time shown:
* if still open and not breached : time remaining
* if still open but breached : with how much time breached
* if closed without breach : in how much time it was closed
* if closed but breached : with how much time breached

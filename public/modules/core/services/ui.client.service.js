'use strict';

angular.module('core').service('hopeUI', [
    function() {
        return {
            initSlimscroll: function(option) {
                var _option = option || {};
                var defaultOption = {
                    size: '7px',
                    color: '#a1b2bd',
                    allowPageScroll: true,
                    height: $(this).attr('data-height'),
                    disableFadeOut: true
                };
                _option = _.assign(defaultOption, option);
                setTimeout(function() {
                    $('.scroller').each(function() {
                        $(this).slimScroll(_option);
                    });
                }, 50);
            }

        };
    }
]);

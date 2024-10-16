;(function($) {
    "use strict";

    const App = {
        data: {
            deactivationUrl: null,
            $feedback: null
        },
        fn: {
            show: (deactivationUrl) => {
                App.globals = vision_feedback_globals;
                App.data.deactivationUrl = deactivationUrl;
                App.data.$feedback = $("#vision-feedback");

                App.data.$feedback.addClass("vision-active").css("display","");
                App.data.$feedback.find(".vision-fields").off().on("click", "input[type=radio]", App.fn.select);
                App.data.$feedback.find(".vision-close").off().on("click", App.fn.close);
                App.data.$feedback.find(".vision-btn.vision-submit").off().on("click", App.fn.submit);
                App.data.$feedback.find(".vision-btn.vision-skip").off().on("click", App.fn.skip);
            },
            select: (e) => {
                const $radio = $(e.target);
                App.data.$feedback.find(".vision-fields input[type=text]").removeClass("vision-active");
                $radio.closest(".vision-field").find("input[type=text]").addClass("vision-active");
            },
            close: () => {
                App.data.$feedback.removeClass("vision-active");
            },
            deactivate: () => {
                App.fn.close();
                window.location.href = App.data.deactivationUrl;
                $(document).off("click", "tr[data-slug='vision']");
            },
            skip: () => {
                App.fn.deactivate();
            },
            submit: () => {
                const $radio = App.data.$feedback.find(".vision-fields input[type=radio]:checked");
                if($radio.length) {
                    const $description = $radio.closest(".vision-field").find("input[type=text]");
                    const description = $description.length ? $description.val() : "";
                    const reason = $radio.val();
                    const data = JSON.stringify({
                        token: App.globals.token,
                        reason: reason,
                        description: description
                    });

                    $.ajax({
                        url: App.globals.ajax.url,
                        type: "POST",
                        dataType: "json",
                        contentType: "application/json",
                        data: data
                    }).always(() => {
                        App.fn.deactivate();
                    });
                } else {
                    App.fn.deactivate();
                }
            }
        }
    }

    $(document).on("click", "tr[data-slug='vision']", (e) => {
        if($(e.target).parent().hasClass("deactivate")) {
            e.preventDefault();
            App.fn.show(e.target.href);
        }
    });
})(jQuery);
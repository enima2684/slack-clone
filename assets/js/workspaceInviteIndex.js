function configAutocompletion(names){

  let BloodhoundEngine = new Bloodhound({
  datumTokenizer: function(datum) {
    let nameTokens = Bloodhound.tokenizers.whitespace(datum.nickname);
    return nameTokens;
  },
  queryTokenizer: Bloodhound.tokenizers.whitespace,
  local: names
  });

  BloodhoundEngine.initialize();

  $('#bloodhound .typeahead').typeahead({
    hint: true,
    highlight: true,
    minLength: 1
  }, {
    source: BloodhoundEngine.ttAdapter(),
    templates: {
                empty: ['<div class="empty-message">No matches</div>'],
                suggestion: Handlebars.compile(
                  `<div class="user-match">
                    <div><img src="{{avatar}}"></div> {{nickname}}
                  </div>`
                )
            },
    displayKey: user => user.nickname
  });

  $('#bloodhound .typeahead').bind('typeahead:selected', function(obj, datum, name) {
    $("#invitedUserId").val(datum.id);
    console.log(`user ${$("#invitedUserId").val()} selected !`);
    $("button").removeAttr("disabled");
  });

}

function getAjaxUrl(){
  let currentUrl = window.location.href.split('/');
  let workspaceName = currentUrl[currentUrl.length - 2];
  return `/ws/${workspaceName}/getPotentialInvitees`
}

$(document).ready(()=>{
  $("button").attr("disabled", "disabled");
  $.get(getAjaxUrl(), {})
    .done(configAutocompletion)
    .fail((jqXhr, textStatus, errorThrown) => {
      console.log(errorThrown);
    });
});


$(".typeahead").on('input', () => {
  $("button").attr("disabled", "disabled");
});
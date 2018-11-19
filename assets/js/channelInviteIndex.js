$(function() {

  let currentUrl = window.location.href.split('/');
  let workspaceName = currentUrl[currentUrl.length - 3];
  let channelId = currentUrl[currentUrl.length - 2];
  console.log(workspaceName, channelId);

  $.get(`/ws/${workspaceName}/${channelId}/getPotentialInvitees`)
    .done(names => {

      console.log("😹😹😹😹😹😹😹😹😹😹😹😹😹");
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
      });


    })
    .fail(err => {
      console.log("👹👹👹👹👹👹👹👹👹👹");
      console.log(err);
    });

});
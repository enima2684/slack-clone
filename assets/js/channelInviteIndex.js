$(function() {

  let names = [
    {nickname: "amine", id:"1", avatar: "/assets/avatars/avatar.png"},
    {nickname: "corrado", id:"2", avatar: "/assets/avatars/avatar.png"},
    {nickname: "filippo", id:"3", avatar: "/assets/avatars/avatar.png"},
    {nickname: "marie", id:"4", avatar: "/assets/avatars/avatar.png"},
    {nickname: "paul", id:"5", avatar: "/assets/avatars/avatar.png"},
    {nickname: "nizar", id:"6", avatar: "/assets/avatars/avatar.png"},
    {nickname: "jihad", id:"7", avatar: "/assets/avatars/avatar.png"},
    {nickname: "helene", id:"8", avatar: "/assets/avatars/avatar.png"},
    {nickname: "jean nicolas", id:"9", avatar: "/assets/avatars/avatar.png"},
    {nickname: "mathis", id:"10", avatar: "/assets/avatars/avatar.png"},
    {nickname: "mehdi", id:"11", avatar: "/assets/avatars/avatar.png"},
    {nickname: "regis", id:"12", avatar: "/assets/avatars/avatar.png"},
    {nickname: "niccolo", id:"13", avatar: "/assets/avatars/avatar.png"},
    {nickname: "nicolas", id:"14", avatar: "/assets/avatars/avatar.png"},
    {nickname: "chloé", id:"15", avatar: "/assets/avatars/avatar.png"},
    {nickname: "antoine", id:"16", avatar: "/assets/avatars/avatar.png"},
    {nickname: "fareha", id:"17", avatar: "/assets/avatars/avatar.png"},
  ];


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

});
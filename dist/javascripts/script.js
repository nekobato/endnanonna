(function() {
  $('#form-maker').on('submit', function() {
    event.preventDefault();
    $("header").hide();
    $("#form-maker").hide();
    $("#section-out").show();
    return $.ajax('/create', {
      data: $(this).serialize(),
      dataType: "text"
    }).done(function(data) {
      return $("#section-out").html("<img src='/out/" + data + ".gif'>");
    }).fail(function(data) {
      $("header").show();
      $("#form-maker").show();
      $("#section-out").hide();
      return alert(data);
    });
  });

}).call(this);

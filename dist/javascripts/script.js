(function() {
  $('#form-maker').on('submit', function() {
    event.preventDefault();
    $("header").hide();
    $("#form-maker").hide();
    $("#section-out").show();
    return $.ajax('/create', {
      data: $(this).serialize(),
      dataType: "json"
    }).done(function(data) {
      if (data.result === "error") {
        $("header").show();
        $("#form-maker").show();
        $("#section-out").hide();
        return alert(data.msg);
      }
      if (data.result === "success") {
        return $("#section-out").html("<img src='/out/" + data.id + ".gif'>");
      }
    }).fail(function(data) {
      $("header").show();
      $("#form-maker").show();
      return $("#section-out").hide();
    });
  });

}).call(this);

/*
//@ sourceMappingURL=script.js.map
*/
(function($, undefined) {

  var BG = "#EEE";
  var DEAD = "#AAA";
  var BORN = "#111";
  var PARAM = [
    {width: 6, height: 6, startx: 1, starty: 1},
    {width: 6, height: 6, startx: 1, starty: 1},
    {width: 6, height: 6, startx: 1, starty: 2},
    {width: 6, height: 6, startx: 1, starty: 1},
  ];
  var PAT = [
    {data: "o2bo3$o2bo!"},
    {data: "b2ob$o2bo$bobo$2bo!"},
    {data: "b3o$3o!"},
    {data: "bob$2bo$3o!"}
  ];

  var job = [];
  var gol = [];
  var next = [];

  function rect(ctx, i, j) {
    ctx.fillRect(i*35+1, j*35+1, 33, 33);
  }

  function step(ind) {
    var ctx = $("#fig" + ind + " canvas").get(0).getContext('2d');
    var i, tmp;

    tmp = next[ind];

    ctx.fillStyle = BG;
    for (i = 0; i < tmp.dead.length; ++i)
      rect(ctx, tmp.dead[i][0], tmp.dead[i][1]);

    var stop = tmp.dead.length == 0 && tmp.born.length == 0;
    var $btn = $("i", "#fig" + ind + " .btn>button:last-child");

    if (stop) {
      next[ind] = gol[ind].reset(PAT[ind], PARAM[ind]);
      ctx.fillStyle = BORN;
      for (i = 0; i < next[ind].born.length; ++i)
        rect(ctx, next[ind].born[i][0], next[ind].born[i][1]);
    } else {
      next[ind] = gol[ind].next();
      tmp = next[ind];

      ctx.fillStyle = DEAD;
      for (i = 0; i < tmp.dead.length; ++i)
        rect(ctx, tmp.dead[i][0], tmp.dead[i][1]);

      ctx.fillStyle = BORN;
      for (i = 0; i < tmp.born.length; ++i)
        rect(ctx, tmp.born[i][0], tmp.born[i][1]);
    }
  }

  function tick(ind) {
    $("#fig" + ind + " .btn>button:last-child")
        .attr("disabled", "disabled");

    var ctx = $("#fig" + ind + " canvas").get(0).getContext('2d');
    var i, tmp;

    tmp = next[ind];

    ctx.fillStyle = BG;
    for (i = 0; i < tmp.dead.length; ++i)
      rect(ctx, tmp.dead[i][0], tmp.dead[i][1]);

    var stop = tmp.dead.length == 0 && tmp.born.length == 0;
    var $btn = $("i", "#fig" + ind + " .btn>button:first-child");

    if (stop) {
      clearTimeout(job[ind]);

      next[ind] = gol[ind].reset(PAT[ind], PARAM[ind]);
      ctx.fillStyle = BORN;
      for (i = 0; i < next[ind].born.length; ++i)
        rect(ctx, next[ind].born[i][0], next[ind].born[i][1]);

      $btn.removeClass("fa-pause").addClass("fa-play");
      $("#fig" + ind + " .btn>button:last-child")
        .removeAttr("disabled");
      return;
    }

    next[ind] = gol[ind].next();
    tmp = next[ind];

    ctx.fillStyle = DEAD;
    for (i = 0; i < tmp.dead.length; ++i)
      rect(ctx, tmp.dead[i][0], tmp.dead[i][1]);

    ctx.fillStyle = BORN;
    for (i = 0; i < tmp.born.length; ++i)
      rect(ctx, tmp.born[i][0], tmp.born[i][1]);

    if ($btn.hasClass("fa-pause"))
      job[ind] = setTimeout(function(){tick(ind);}, 500);
    else {
      clearTimeout(job[ind]);
      $("#fig" + ind + " .btn>button:last-child")
        .removeAttr("disabled");
    }
  }

  $(function() {

    var ctx, i, j, k;

    for (k = 0; k < 4; ++k) {

      // draw the background grid
      ctx = $("#fig" + k + " canvas").get(0).getContext('2d');
      ctx.fillStyle = BG;
      for (i = 0; i < 6; ++i){
        for (j = 0; j < 6; ++j){
          rect(ctx, i, j);
        }
      }

      job.push(-1);
      gol.push(life.wrapped());

      next.push(gol[k].reset(PAT[k], PARAM[k]));
      ctx.fillStyle = BORN;
      for (i = 0; i < next[k].born.length; ++i)
        rect(ctx, next[k].born[i][0], next[k].born[i][1]);
    }

    // play/pause button
    $(".btn>button:first-child").each(function(ind){
      $(this).click(function(){
        var $i = $("i", $(this));
        $i.toggleClass("fa-play")
          .toggleClass("fa-pause");

        if ($i.hasClass("fa-pause"))
          tick(ind);
      });
    });

    // stop button
    $(".btn>button:nth-child(2)").each(function(ind){
      $(this).click(function(){
        clearTimeout(job[ind]);

        $("i", ".btn>button:first-child")
          .removeClass("fa-pause").addClass("fa-play");
        $(".btn>button:last-child").removeAttr("disabled");

        var ctx = $("#fig" + ind + " canvas").get(0).getContext('2d');
        ctx.fillStyle = BG;
        for (i = 0; i < 6; ++i){
          for (j = 0; j < 6; ++j){
            rect(ctx, i, j);
          }
        }

        next[ind] = (gol[ind].reset(PAT[ind], PARAM[ind]));
        ctx.fillStyle = BORN;
        for (i = 0; i < next[ind].born.length; ++i)
          rect(ctx, next[ind].born[i][0], next[ind].born[i][1]);
      });
    });

    $(".btn>button:last-child").each(function(ind){
      $(this).click(function(){
        step(ind);
      });
    });

  });
})(jQuery);

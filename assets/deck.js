jQuery(document).ready(function(){
  jQuery("dl").hide();

  jQuery("#code").keydown(function(e){
    if ( this.setSelectionRange ) {
      var start = this.selectionStart, val = this.value;

      if ( e.keyCode == 13 ) {
        var match = val.substring(0, start).match(/(^|\n)([ \t]*)([^\n]*)$/);
        if ( match ) {
          var spaces = match[2], length = spaces.length + 1;
          this.value = val.substring(0, start) + "\n" + spaces + val.substr(this.selectionEnd);
          this.setSelectionRange(start + length, start + length);
          this.focus();
          return false;
        }
      } else if ( e.keyCode == 8 ) {
        if ( val.substring(start - 2, start) == "  " ) {
          this.value = val.substring(0, start - 2) + val.substr(this.selectionEnd);
          this.setSelectionRange(start - 2, start - 2);
          this.focus();
          return false;
        }
      } else if ( e.keyCode == 9 ) {
        this.value = val.substring(0, start) + "  " + val.substr(this.selectionEnd);
        this.setSelectionRange(start + 2, start + 2);
        this.focus();
        return false;
      }
    }
  });

  jQuery("#pre").dblclick(function(){
    jQuery("#pre").hide();
    jQuery("#code").focus();
  });

  jQuery("#prev").click(function(){
    pos--;
    loadSample();
  });

  jQuery("#next").click(function(){
    pos++;
    loadSample();
  });

  var stasis = {};
  for ( var item in window ) {
    stasis[item] = true;
  }

  var pos;

  if ( location.hash ) {
    pos = parseInt(location.hash.substr(1)) - 1;
    loadSample();
  } else {
    showTOC();
  }

  function showTOC(){
    jQuery("#pre").empty();
    jQuery("h3").removeClass("large").html("Advanced JavaScript");
    jQuery("#pre, #code").height(425).show();

    jQuery("dt").each(function(i, dt){
      jQuery("<a href='#" + (i+1) + "'>" + (i+1) + ") " + this.innerHTML + "\n</a>").click(function(){
        pos = i;
        loadSample();
        return false;
      }).appendTo("#pre");
    });

    jQuery("div.buttons").hide();
  }

  function loadSample(){
    jQuery("div.buttons").show();

    var code = jQuery("#code");

    var source = (jQuery("dd").eq(pos).find("pre").html() || "")
                            .replace(/(^|\n) /g, "$1").replace(/ ($|\n)/g, "$1");

    if ( !source ) {
      jQuery("h3").addClass("large");
      jQuery("#pre, #code, #cite").hide();
    } else {
      jQuery("h3").removeClass("large");
      jQuery("#pre, #code, #cite").show();
    }

    jQuery("h3").html( (source ? "#" + (pos + 1) + ": " : "") + jQuery("dt").eq(pos).html() );
    source = source.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
    code.val(source);

    // rewrite all assertDeepEqual()s to show the value + reason in a comment
    var output = Falafel(source, function (node) {
      if (node.type === 'CallExpression' && (node.callee.name === 'assertDeepEqual' || node.callee.name === 'assertTripleEqual')) {
        var actual = node.arguments[0].source();
        var expected = node.arguments[1].source();
        var reason = node.arguments[2];
        if (reason) {
          expected += ' -- ' + reason.value;
        }

        var newSource = actual + '; /* ' + expected + ' */';
        // update the parent (ExpressionStatement) so that the semicolon isn't included
        node.parent.update(newSource);
      }
    });

    jQuery("#pre").html( output.toString() ).chili();

    // hide the commented values
    var $values = jQuery('#pre .mlcom');
    $values.each(function(i, el) {
      var $el = jQuery(el);
      var value = $el.text().replace(/(\/\*|\*\/)/g, '').trim();
      var newContents = '<span class="question">// ?</span><span class="value">// ' + value + '</span>';
      $el.html(newContents);
    });

    // hide answers when code is copied. ideally 'user-select: none' would be used, but
    // https://bugs.webkit.org/show_bug.cgi?id=80159
    $(document).on('selectionchange', function(e){
      var selection = window.getSelection();
      if (selection.isCollapsed) {
        $values.show();
      } else {
        $values.hide();
      }
    });

    jQuery("#results").empty();

    code.add("#pre").height(275)[0];

    if ( code[0].scrollHeight > 275 )
      code.add("#pre").height( code[0].scrollHeight + 5 );

    var last = jQuery("dt").length - 1;

    if ( pos == 0 )
      jQuery("#prev").css("visibility", "hidden");
    if ( pos > 0 )
      jQuery("#prev").css("visibility", "visible");

    if ( pos == last )
      jQuery("#next").css("visibility", "hidden");
    if ( pos < last )
      jQuery("#next").css("visibility", "visible");

    window.location.hash = pos + 1;
  }

  setInterval(function(){
    if ( location.hash != ("#" + (pos + 1)) ) {
      var num = parseInt(location.hash.substr(1)) - 1;
      if ( isNaN(num) ) {
        if ( jQuery("div.buttons").is(":visible") ) {
          showTOC();
        }
      } else {
        pos = num;
        loadSample();
      }
    }
  }, 100);
});

$(function availability_script() {
    var unavailable_blocks=new Array();
    var isMouseDown = false,
        isHighlighted;
     
    $('#modal').on('mousedown', '.week-availability .slot', function() {
        unavailable_blocks = [];
        isMouseDown = true;
        $(this).toggleClass("highlighted");
        isHighlighted = $(this).hasClass("highlighted");
        document.getElementById('id_unavailable_blocks').value=unavailable_blocks
        return false; // prevent text selection
      })
    
      .on('mouseover', '.week-availability .slot', function () {
        if (isMouseDown) {
          $(this).toggleClass("highlighted", isHighlighted);
        }
      })
    
      .bind("selectstart", function () {
        return false;
      })
  
    $('#modal').mouseup(function () {
        isMouseDown = false;
        $('.highlighted').each(function() {
          if (!unavailable_blocks.includes(($(this).attr('timeslot')))){
            unavailable_blocks.push(($(this).attr('timeslot')));
          }
        });
      document.getElementById('id_unavailable_blocks').value=unavailable_blocks
      });

    $('#modal').on('hide.bs.modal', function() {
      $('#modal').unbind('mousedown');
      $('#modal').unbind('mouseover');
      $('#modal').unbind('mouseup');
      $('#modal').unbind('hide.bs.modal');
      console.log("UN BINDED");
    })
      
  });
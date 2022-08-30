var xl;

function addHeaderCell(workBook, columnIndex, columnTitle, columnSyle, width){
  workBook.cell(1, columnIndex).string(columnTitle).style(columnSyle);
  workBook.column(columnIndex).setWidth(width);
}

function createExcelFile(filePath, headerCellList , dataSet){
  return new Promise(function(resolve, reject) {
    var wb = new xl.Workbook();
    var ws = wb.addWorksheet('Sheet 1');

    var myStyle = wb.createStyle({
      font: {
        bold: true,
        color: '#f95444',
      },
    });

    var style = wb.createStyle({
      alignment: {
        horizontal: 'center',
      },
      font: {
        color: '#000000',
        size: 12,
      },
      border: {
        left: {
            style: 'thin',
            color: '#000000'
        },
        right: {
            style: 'thin',
            color: '#000000'
        },
        top: {
            style: 'thin',
            color: '#000000'
        },
        bottom: {
            style: 'thin',
            color: '#000000'
        },
        outline:true,
      },
      numberFormat: '#,##0.00; (#,##0.00); -',
    });

    var textStyle = wb.createStyle({
      alignment: {
        horizontal: 'center',
      },
      border: {
        left: {
            style: 'thin',
            color: '#000000'
        },
        right: {
            style: 'thin',
            color: '#000000'
        },
        top: {
            style: 'thin',
            color: '#000000'
        },
        bottom: {
            style: 'thin',
            color: '#000000'
        },
        outline:true,
      },
      font: {
        size: 12,
      },
    });

    var headerStyle = wb.createStyle({
      alignment: {
        horizontal: 'center',
      },
      border: {
        left: {
            style: 'medium',
            color: '#000000'
        },
        right: {
            style: 'medium',
            color: '#000000'
        },
        top: {
            style: 'medium',
            color: '#000000'
        },
        bottom: {
            style: 'medium',
            color: '#000000'
        },
        outline:true,
      },
      font: {
        bold: true,
        size: 12,
      },
      fill : {
        type: 'pattern',
        patternType: 'lightUp',
        bgColor: '#98c379',
        fgColor: '#77b54b',
      }
    });


    ws.addConditionalFormattingRule('H1:H1000', {
      // apply ws formatting ref 'A1:A10'
      type: 'expression', // the conditional formatting type
      priority: 1, // rule priority order (required)
      formula: 'NOT(ISERROR(SEARCH("accepted", H1)))', // formula that returns nonzero or 0
      style: myStyle, // a style object containing styles to apply
    });

    headerCellList.forEach(function(headerCell, index, dataSet){
        addHeaderCell(ws, index + 1, headerCell.title, headerStyle, headerCell.width);
    });

    ws.row(1).freeze();

    dataSet.forEach(function(dataSetRowItem){
      var currentRowIndex = dataSetRowItem.row;
      dataSetRowItem.cellList.forEach(function(cell){
        var currentColumn = cell.column;
        var currentValue = cell.value;
        if(cell.type == 'String'){
          ws.cell(currentRowIndex, currentColumn).string(currentValue).style(textStyle);
        }else if(cell.type == 'Number'){
          ws.cell(currentRowIndex, currentColumn).number(currentValue).style(style);
        }
      });
    });

    wb.write(filePath,function(err, status){
      if(err){
        reject(err);
      }
      resolve(filePath);
    });
  });
}

exports = module.exports = function(options){
  xl = options.xl;

  this.createExcelFile = createExcelFile;
};

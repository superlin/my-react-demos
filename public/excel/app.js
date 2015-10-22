var headers = [ "Book", "Author", "Language", "Published", "Sales" ];

var data=[
  ["The Lord of the Rings", "J. R. R. Tolkien","English", "1954–1955", "150 million"],
  ["Le Petit Prince (The Little Prince)", "Antoine de Saint-Exupéry", "French", "1943", "140 million"],
  ["Harry Potter and the Philosopher's Stone", "J. K. Rowling", "English", "1997", "107 million"],
  ["And Then There Were None", "Agatha Christie", "English", "1939", "100 million"],
  ["Dream of the Red Chamber", "Cao Xueqin", "Chinese", "1754–1791", "100 million"],
  ["The Hobbit", "J. R. R. Tolkien", "English", "1937", "100 million"],
  ["She: A History of Adventure", "H. Rider Haggard", "English", "1887", "100 million"]
];

var PropTypes = React.PropTypes;
var Excel = React.createClass({
  displayName: 'Excel',
  _preSearchData: null,
  propTypes: {
    headers: PropTypes.arrayOf(
      PropTypes.string
    ),
    initialData: React.PropTypes.arrayOf(
      PropTypes.arrayOf(
        PropTypes.string
      )
    )
  },
  getInitialState: function() {
    return {
      data: this.props.initialData,
      sortby: null,
      descending: false,
      edit: null,
      search: false
    };
  },
  _sort: function(e) {
    var column = e.target.cellIndex;
    var data = this.state.data.slice();
    var descending = this.state.sortby === column && !this.state.descending;

    data.sort(function(a, b) {
      return descending ? a[column] < b[column] : a[column] > b[column];
    });
    this.setState({
      data: data,
      sortby: column,
      descending: descending
    });
  },
  _showEditor: function(e) {
    this.setState({
      edit: {
        row: parseInt(e.target.dataset.row, 10),
        cell: e.target.cellIndex
      }
    });
  },
  _save: function(e) {
    e.preventDefault();

    var input = e.target.firstChild;
    var data = this.state.data.slice();
    var edit = this.state.edit;

    data[edit.row][edit.cell] = input.value;
    this.setState({
      edit: null,
      data: data
    });
  },
  _search: function(e) {
    var needle = e.target.value.toLowerCase();
    if (!needle) {
      this.setState({data: this._preSearchData});
      return;
    }
    var idx = e.target.dataset.idx;
    var searchdata = this._preSearchData.filter(function (row) {
      return row[idx].toString().toLowerCase().indexOf(needle) > -1;
    });
    this.setState({data: searchdata});
  },
  _toggleSearch: function() {
    if (this.state.search) {
      this.setState({
        data: this._preSearchData,
        search: false
      });
      this._preSearchData = null;
    } else {
      this._preSearchData = this.state.data;
      this.setState({
        search: true
      });
    }
  },
  _renderSearch: function() {
    if (!this.state.search) {
      return null;
    }
    return (
      <tr onChange={this._search}>
      {
        this.props.headers.map(function(_ignore, idx) {
          return (
            <td key={idx}>
              <input type="text" data-idx={idx}/>
            </td>
          );
        })
      }
      </tr>
    );
  },
  _download: function (format, ev) {
    var contents = format === 'json' ? JSON.stringify(this.state.data)
      : this.state.data.reduce(function(result, row) {
        return result + row.reduce(function(rowresult, cell, idx) {
          return rowresult + '"' + cell.replace(/"/g, '""') + '"' +(idx<row.length-1?',':'');
        }, '') + "\n";
      }, '');

    var URL = window.URL || window.webkitURL;
    var blob = new Blob([contents], {type: 'text/' + format});
    ev.target.href = URL.createObjectURL(blob);
    ev.target.download = 'data.' + format;
  },
  _renderToolbar: function() {
    return (
      <div className="toolbar">
        <button onClick={this._toggleSearch}>Search</button>
        <a onClick={this._download.bind(this, 'json')}>Export JSON</a>
        <a onClick={this._download.bind(this, 'csv')}>Export CSV</a>
      </div>
    );
  },
  _renderTable: function() {
    var self = this;
    return (
      <table>
        <thead onClick={self._sort}>
          <tr>
          {
            self.props.headers.map(function(title, idx) {
              if (self.state.sortby === idx) {
                title += self.state.descending ? ' \u2191' : ' \u2193';
              }
              return (<th key={idx}>{title}</th>);
            })
          }
          </tr>
        </thead>
        <tbody onDoubleClick={self._showEditor}>
        {
          self._renderSearch(),
          self.state.data.map(function(row, rowidx) {
            return (
              <tr key={rowidx}>
              {
                row.map(function (cell, idx) {
                  var content = cell;
                  var edit = self.state.edit;

                  if (edit && edit.row === rowidx && edit.cell === idx) {
                    content = (
                      <form onSubmit={self._save}>
                        <input type="text" defaultValue={content}/>
                      </form>
                    );
                  }

                  return (
                    <td key={idx} data-row={rowidx} >{content}</td>
                  );
                })
              }
              </tr>
            );
          })
        }
        </tbody>
      </table>
    );
  },
  render: function () {
    var self = this;
    return (
      <div>
        {this._renderToolbar()}
        {this._renderTable()}
      </div>
    );
  }
});

React.render(
  <Excel headers={headers} initialData={data}></Excel>,
  document.getElementById("app")
);

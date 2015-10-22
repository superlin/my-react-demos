var PropTypes = React.PropTypes;

var Counter = React.createClass({
  name: 'Counter',
  mixins: [React.addons.PureRenderMixin],
  propTypes: {
    count: PropTypes.number.isRequired
  },
  render: function() {
    return (
      <span>{this.props.count}</span>
    );
  }
});

var TextAreaCounter = React.createClass({
  name: 'TextAreaCounter',
  propTypes: {
    defaultValue: PropTypes.string
  },
  getInitialState: function() {
    return {
      text: this.props.defaultValue
    };
  },
  _textChange: function (ev) {
    this.setState({
      text: ev.target.value
    });
  },
  render: function() {
    var counter = null;
    var len = this.state.text.length;
    if (len > 0) {
      counter = (
        <h3>
          <Counter count={len} />
        </h3>
      );
    }
    return (
      <div>
        <textarea defaultValue={this.state.text} onChange={this._textChange} />
        {counter}
      </div>
    );
  }
});

var myTextAreaCounter = React.render(
  <TextAreaCounter defaultValue="Bob" />,
  document.getElementById("app")
);

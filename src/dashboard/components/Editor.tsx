import * as Preact from "preact";

export default class Editor extends Preact.Component<
  {
    value?: string;
    onChange?: (value: string) => any;
    language?: string;
    theme?: string;
  } & Preact.JSX.HTMLAttributes<HTMLDivElement>
> {
  ref = Preact.createRef();
  editor;
  componentDidMount() {
    //@ts-ignore
    require(["vs/editor/editor.main"], () => {
      this.onLoad();
    });
  }
  onLoad = () => {
    //@ts-ignore
    this.editor = monaco.editor.create(this.ref.current, {
      value: this.props.value,
      language: this.props.language ?? "markdown",
      lineNumbers: "off",
      theme: this.props.theme,
      minimap: { enabled: false },
    });
    this.editor.onDidChangeModelContent(() => {
      const value = this.editor.getValue();
      this.props.onChange && this.props.onChange(value);
    });
    window.onresize = this.onResize;
  };
  componentWillUnmount() {
    delete window.onresize;
  }
  onResize = () => {
    this.editor.layout();
  };
  render() {
    const { value, onChange, style, ...props } = this.props;
    return (
      <div
        ref={this.ref}
        style={Object.assign({ width: "100%", minHeight: 300 }, style)}
        {...props}
      />
    );
  }
}

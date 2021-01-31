import * as Preact from "preact";
import * as monaco from "monaco-editor";

export default class Editor extends Preact.Component<
  {
    value?: string;
    onChange?: (value: string) => any;
    language?: string;
    theme?: string;
  } & Preact.JSX.HTMLAttributes<HTMLDivElement>
> {
  ref = Preact.createRef();
  editor: monaco.editor.IStandaloneCodeEditor;
  componentDidMount() {
    this.editor = monaco.editor.create(this.ref.current, {
      value: this.props.value,
      language: this.props.language ?? "markdown",
      lineNumbers: "off",
      theme: this.props.theme,
      minimap: { enabled: false },
    });
    this.editor.onDidChangeModelContent(() => {
      if (!this.props.onChange) return;
      this.props.onChange(this.editor.getValue());
    });
  }

  render() {
    const { value, onChange, style, ...props } = this.props;
    return (
      <div
        ref={this.ref}
        style={Object.assign({}, defaultStyle, style)}
        {...props}
      />
    );
  }
}

const defaultStyle = {
  width: "100%",
  minHeight: 350,
  height: "100%",
  flex: 1,
};

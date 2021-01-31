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
    this.ref.current.onload = () => {
      this.ref.current.contentWindow.postMessage({
        value: this.props.value,
        language: this.props.language ?? "markdown",
        lineNumbers: "off",
        theme: this.props.theme,
        minimap: { enabled: false },
      });
    };
    window.onmessage = (e) => {
      this.props.onChange && this.props.onChange(e.data);
    };
  }

  render() {
    const { value, onChange, style, ...props } = this.props;
    return (
      <iframe
        src="/admin/static/vs/editor.html"
        ref={this.ref}
        frameBorder="0"
        crossOrigin="true"
        sandbox="allow-scripts allow-same-origin"
        style={Object.assign(
          { width: "100%", minHeight: 300, background: "#1e1e1e" },
          style
        )}
        {...props}
      />
    );
  }
}

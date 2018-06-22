import * as React from "react";
import { createPortal } from "react-dom";
// @ts-ignore
import { StyleSheet } from "@emotion/sheet";
// @ts-ignore
import createCache from "@emotion/cache";
// @ts-ignore
import { CSSContext } from "@emotion/core";
// @ts-ignore
import styled from '@emotion/styled'
import "./App.css";

interface FrameProps {}

class Frame extends React.Component<FrameProps> {
  node?: HTMLIFrameElement | null;

  _isMounted: boolean;

  didInitialRender = false;

  _frameLoad: () => void;

  constructor(props: FrameProps) {
    super(props);

    this._frameLoad = this.frameDidLoad.bind(this);
  }

  componentDidMount() {
    this._isMounted = true;

    if (!this.node) return;

    if (
      this.node.contentDocument &&
      this.node.contentDocument.readyState === "complete"
    ) {
      this.forceUpdate();
    }

    this.node.addEventListener("load", this._frameLoad);
  }

  componentWillUnmount() {
    this._isMounted = false;

    if (this.node) this.node.removeEventListener("load", this._frameLoad);
  }

  frameDidLoad() {
    this.forceUpdate();
  }

  renderFrameContents() {
    if (!this._isMounted) return null;
    if (!this.node) return null;

    const doc = this.node.contentDocument!;

    if (!this.didInitialRender) {
      const initialContent = `
        <!DOCTYPE html>
        <html lange="en">
          <head></head>
          <body>
            <div class="frame-root"></div>
          </body>
        </html>
      `;

      doc.open("text/html", "replace");
      doc.write(initialContent);
      doc.close();
      this.didInitialRender = true;
    }

    const root = doc.body.children[0];

    const sheet = new StyleSheet({
      container: root
    });
    sheet.insert(".yo { color: hotpink; font-size: 4rem; }");

    const cache = createCache({
      container: root
    });

    return createPortal(
      <CSSContext.Provider value={cache}>
        {this.props.children}
      </CSSContext.Provider>,
      root
    );
  }

  render() {
    return (
      <iframe ref={node => (this.node = node)}>
        {this.renderFrameContents()}
      </iframe>
    );
  }
}

const X = styled.div`
  color: red;
  font-size: 4rem;
`

class App extends React.Component {
  public render() {
    return (
      <div className="App">
        Outer
        <Frame>
          <X>Ok</X>
        </Frame>
      </div>
    );
  }
}

export default App;

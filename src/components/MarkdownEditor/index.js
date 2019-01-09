import React, { PureComponent } from 'react';
import { Input } from 'antd';

import SimpleMDE from 'simplemde';
import marked from 'marked';
import highlight from 'highlight.js';

import 'simplemde/dist/simplemde.min.css';
import 'highlight.js/styles/darcula.css';

import styles from './index.less';

const { TextArea } = Input;

class MarkdownEditor extends PureComponent {
  state = {
    smde: undefined,
  };

  componentDidMount() {
    const simplemde = new SimpleMDE({
      element: document.getElementById('editor').childElementCount,
      autofocus: true,
      autosave: true,
      status: false,
      previewRender(plainText) {
        return marked(plainText, {
          renderer: new marked.Renderer(),
          gfm: true,
          pedantic: false,
          sanitize: false,
          tables: true,
          breaks: true,
          smartLists: true,
          smartypants: true,
          highlight(code) {
            return highlight.highlightAuto(code).value;
          },
        });
      },
    });
    simplemde.codemirror.on('change', () => {
      const { onChange } = this.props;
      onChange(simplemde.value());
    });
    this.setState({
      smde: simplemde,
    });
  }

  componentWillReceiveProps(nextProps) {
    const { value } = nextProps;
    const { smde } = this.state;
    if (value && smde && value !== smde.value()) {
      smde.value(value);
    }
  }

  render() {
    return (
      <div className={styles.markdownDiv}>
        <TextArea id="editor" />
      </div>
    );
  }
}

export default MarkdownEditor;

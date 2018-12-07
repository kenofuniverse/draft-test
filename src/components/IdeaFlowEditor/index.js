import React, { Component } from 'react';
import {
  Entity,
  Modifier,
  EditorState
} from 'draft-js';
import {
  AutoCompleteEditor,
  SuggestionList
} from '../../components';
import * as triggers from '../../constants';
import * as utils from '../../utils';

const persons = [
  'Ruben Simon',
  'Jacquelyn Hendrix',
  'Landen Wallace',
  'Jovani Bauer',
  'Jerimiah Knox',
  'Nina Escobar',
  'Casey Strong',
  'Dylan Ramirez',
  'Trevor Rice',
  'Harper Carroll'
];

const tags = [
  'react',
  'angular',
  'vue',
  'javascript',
  'css',
  'html',
  'php',
  'wordpress',
  'node.js'
];

const relations = [
  'foodslist',
  'restaurantlist',
  'busstoplist'
];

class IdeaFlowEditor extends Component {
  constructor(props) {
    super(props);

    this.state = {
      editorState: EditorState.createEmpty(),
      autoCompleteState: null,
      filteredArray: []
    };
  }

  onChange = (editorState) => this.setState({
    editorState
  });

  onCompleteChange = (autoCompleteState) => this.setState({
    autoCompleteState
  }, () => {
    if (autoCompleteState) {
      this.setState({
        filteredArray: this.getFilteredArray(autoCompleteState.type, autoCompleteState.text)
      });
    }
  });

  onInsert = (insertState) => {
    const { filteredArray } = this.state;
    if (!filteredArray) {
      return null;
    }
    const index = utils.normalizeIndex(insertState.selectedIndex, filteredArray.length);
    insertState.text = insertState.trigger + filteredArray[index];
    return this.addSuggestion(insertState);
  };

  addSuggestion = ({editorState, start, end, trigger, text}) => {
    const entityKey = Entity.create('MENTION', 'IMMUTABLE');
    const currentSelectionState = editorState.getSelection();
    const mentionTextSelection = currentSelectionState.merge({
      anchorOffset: start,
      focusOffset: end
    });
  
    let insertingContent = Modifier.replaceText(
      editorState.getCurrentContent(),
      mentionTextSelection,
      text,
      ['link', 'BOLD'],
      entityKey
    );
 
    const blockKey = mentionTextSelection.getAnchorKey();
    const blockSize = editorState.getCurrentContent().getBlockForKey(blockKey).getLength();
    if (blockSize === end) {
      insertingContent = Modifier.insertText(
        insertingContent,
        insertingContent.getSelectionAfter(),
        ' '
      );
    }
  
    let newEditorState = EditorState.push(
      editorState,
      insertingContent,
      'insert-mention'
    );
  
    return EditorState.forceSelection(newEditorState, insertingContent.getSelectionAfter());
  };

  renderAutocomplete() {
    const {
      autoCompleteState,
      filteredArray
    } = this.state;
    if (!autoCompleteState || !filteredArray) {
      return null;
    }
    autoCompleteState.array = filteredArray;
    autoCompleteState.onSuggestionClick = this.onSuggestionItemClick;
    return <SuggestionList suggestionsState = { autoCompleteState } />;
  };

  getFilteredArray(type, text) {
    let dataArray;
    switch (type) {
      case triggers.TAG:
        dataArray = tags;
        break;
      case triggers.PERSON:
        dataArray = persons;
        break;
      case triggers.RELATIONS:
        dataArray = relations;
        break;
      default:
        break;
    }
    if (!dataArray) {
      return [];
    }
    const filteredArray = utils.filterArray(dataArray, text.replace(triggers.regExByType(type), ''));
    return filteredArray;
  }

  render() {
    return (
      <div className="main-container">
        <div className="editor">
          <AutoCompleteEditor
            editorState = {this.state.editorState}
            onCompleteChange = {this.onCompleteChange}
            onChange = {this.onChange}
            onInsert = {this.onInsert}
          />
        </div>
        {this.renderAutocomplete()}
      </div>
    );
  }
}

export default IdeaFlowEditor;

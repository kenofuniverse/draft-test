import React from 'react';
import PropTypes from 'prop-types';
import { Editor } from 'draft-js';
import * as triggers from '../../constants';

class AutoCompleteEditor extends Editor {
  
  constructor(props) {
    super(props);
    this.autoCompleteState = null;
  }

  onChange = (editorState) => {
    const {
      onChange,
      onCompleteChange
    } = this.props;

    if (onChange) {
      onChange(editorState);
    }

    if (onCompleteChange) {
      window.requestAnimationFrame(() => {
        onCompleteChange(this.getAutoCompleteState());
      });
    }
  };

  onArrow = (e, originalHandler, nudgeAmount) => {
    const {
      onCompleteChange
    } = this.props;
    let autoCompleteState = this.getAutoCompleteState(false);
    if (!autoCompleteState) {
      if (originalHandler) {
        originalHandler(e);
      }
      return;
    }

    e.preventDefault();
    autoCompleteState.selectedIndex += nudgeAmount;
    this.autoCompleteState = autoCompleteState;
    if (onCompleteChange) {
      onCompleteChange(autoCompleteState);
    }
  };

  onUpArrow = (e) => {
    this.onArrow(e, this.props.onUpArrow, -1);
  };

  onDownArrow = (e) => {
    this.onArrow(e, this.props.onDownArrow, 1);
  };


  onEscape = (e) => {
    const {
      onEscape,
      onCompleteChange
    } = this.props;

    if (!this.getAutoCompleteState(false)) {
      if (onEscape) {
        onEscape(e);
      }
      return;
    }

    e.preventDefault();
    this.autoCompleteState = null;

    if (onCompleteChange) {
      onCompleteChange(null);
    }
  };

  onTab = (e) => {
    this.commitSelection(e)
  };

  onReturn = (e) => {
    return this.commitSelection(e);
  }

  onMentionSelect() {
    const {
      onInsert,
      onChange
    } = this.props;

    let autocompleteState = this.getAutoCompleteState(false);
    let newEditorState;

    const insertState = this.getInsertState(autocompleteState.selectedIndex, autocompleteState.trigger);
    
    if (onInsert) {
      newEditorState = onInsert(insertState);
    }

    if (onChange && newEditorState) {
      onChange(newEditorState);
    }
  };

  commitSelection(e) {
    const {
      onCompleteChange
    } = this.props;
    let autocompleteState = this.getAutoCompleteState(false);
    if (!autocompleteState) {
      return false;
    }
    e.preventDefault();
    this.onMentionSelect();
    this.autoCompleteState = null;

    if (onCompleteChange) {
      onCompleteChange(null);
    }
    return true;
  };

  hasEntityAtSelection() {
    const {
      editorState
    } = this.props;

    const selection = editorState.getSelection();
    if (!selection.getHasFocus()) {
      return false;
    }

    const contentState = editorState.getCurrentContent();
    const block = contentState.getBlockForKey(selection.getStartKey());
    return !!block.getEntityAt(selection.getStartOffset() - 1);
  };

  getInsertState(selectedIndex, trigger) {
    const {
      editorState
    } = this.props;

    const currentSelectionState = editorState.getSelection();
    const end = currentSelectionState.getAnchorOffset();
    const anchorKey = currentSelectionState.getAnchorKey();
    const currentContent = editorState.getCurrentContent();
    const currentBlock = currentContent.getBlockForKey(anchorKey);
    const blockText = currentBlock.getText();
    const start = blockText.substring(0, end).lastIndexOf(trigger);

    return {
      editorState,
      start,
      end,
      trigger,
      selectedIndex
    }
  }

  getAutoCompleteRange(trigger) {
    const selection = window.getSelection();
    if (selection.rangeCount === 0) {
      return null;
    }

    if (this.hasEntityAtSelection()) {
      return null;
    }

    const range = selection.getRangeAt(0);
    let text = range.startContainer.textContent;
    text = text.substring(0, range.startOffset);
    const index = text.lastIndexOf(trigger);
    if (index === -1) {
      return null;
    }
    text = text.substring(index);
    return {
      text,
      start: index,
      end: range.startOffset
    };
  };

  getAutoCompleteState(invalidate = true) {
    if (!invalidate) {
      return this.autoCompleteState;
    }

    let type = null;
    let trigger = null;
    let range = null;

    const tagRange = this.getAutoCompleteRange(triggers.TAG_TRIGGER);
    const personRange = this.getAutoCompleteRange(triggers.PERSON_TRIGGER);
    const relativeRange = this.getAutoCompleteRange(triggers.RELATIONS_TRIGGER);

    if (!tagRange && !personRange && !relativeRange) {
      this.autoCompleteState = null;
      return null;
    }
    
    if (!tagRange && !relativeRange) {
      range = personRange;
      type = triggers.PERSON;
      trigger = triggers.PERSON_TRIGGER;
    }

    if (!personRange && !relativeRange) {
      range = tagRange;
      type = triggers.TAG;
      trigger = triggers.TAG_TRIGGER;
    }

    if (!tagRange && !personRange) {
      range = relativeRange;
      type = triggers.RELATIONS;
      trigger = triggers.RELATIONS_TRIGGER
    }
    
    if (!range) {
      if (tagRange && personRange) {
        range = tagRange.start > personRange.start ? tagRange : personRange;
        type = tagRange.start > personRange.start ? triggers.TAG : triggers.PERSON;
        trigger = tagRange.start > personRange.start ? triggers.TAG_TRIGGER : triggers.PERSON_TRIGGER;
      }

      if (tagRange && relativeRange) {
        range = tagRange.start > relativeRange.start ? tagRange : relativeRange;
        type = tagRange.start > relativeRange.start ? triggers.TAG : triggers.RELATIONS;
        trigger = tagRange.start > relativeRange.start ? triggers.TAG_TRIGGER : triggers.RELATIONS_TRIGGER;
      }

      if (personRange && relativeRange) {
        range = personRange.start > relativeRange.start ? personRange : relativeRange;
        type = personRange.start > relativeRange.start ? triggers.PERSON : triggers.RELATIONS;
        trigger = personRange.start > relativeRange.start ? triggers.PERSON_TRIGGER : triggers.RELATIONS_TRIGGER;
      }
    }

    const tempRange = window.getSelection().getRangeAt(0).cloneRange();
    tempRange.setStart(tempRange.startContainer, range.start);

    const rangeRect = tempRange.getBoundingClientRect();
    let [left, top] = [rangeRect.left, rangeRect.bottom];

    this.autoCompleteState = {
      trigger,
      type,
      left,
      top,
      text: range.text,
      selectedIndex: 0
    };
    return this.autoCompleteState;
  };


  render() {
    const { editorState } = this.props;
    const styles = {
      link: {
        color: 'blue'
      }
    };

    return ( 
      <Editor
        customStyleMap = {styles}
        editorState = {editorState}
        handleReturn = {this.onReturn}
        onChange = {this.onChange}
        onEscape = {this.onEscape}
        onUpArrow = {this.onUpArrow}
        onDownArrow = {this.onDownArrow}
        onTab = {this.onTab}
      />
    );
  }
};

AutoCompleteEditor.propTypes = {
  onChange: PropTypes.func.isRequired,
  onCompleteChange: PropTypes.func.isRequired,
  onInsert: PropTypes.func.isRequired,
  editorState: PropTypes.any.isRequired
};

export default AutoCompleteEditor;

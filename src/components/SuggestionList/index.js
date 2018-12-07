import React, { Component } from 'react';
import PropTypes from 'prop-types';
import * as utils from '../../utils';
import * as triggers from '../../constants';
import '../style.css';

class SuggestionList extends Component {
  renderSuggestionItem(type, item) {
    switch(type) {
      case triggers.PERSON:
        return (<span>{item}</span>);
      case triggers.TAG:
        return (<span>#{item}</span>);
      case triggers.RELATIONS:
        return (<span>{item}</span>);
      default:
        return null;
    }
  }

  render() {
    const { suggestionsState } = this.props;
    const {
      left,
      top,
      array,
      selectedIndex,
      type,
    } = suggestionsState;

    if (!array) {
      return null;
    }

    const normalizedIndex = utils.normalizeIndex(
      selectedIndex, array.length
    );

    return (
      <ul className="suggestion-list" style={ { left, top } }>
      {

        array.map((item, index) => {
          return (
            <li key = {index} className = { normalizedIndex === index ? 'selected' : '' }>
              {this.renderSuggestionItem(type, item)}
            </li>
          );
        }) }
      </ul>
    );
  }
};

SuggestionList.propTypes = {
  suggestionsState: PropTypes.any.isRequired
};

export default SuggestionList;

import check from "images/check.svg";
import down_gray from "images/down_gray_1x.png";
import down_white from "images/down_wht_1x.png";
import up_gray from "images/up_gray_1x.png";
import up_white from "images/up_wht_1x.png";
import React, { Component } from "react";

/**
 *
 */
const DROP_UP = "UP";
const DROP_DOWN = "DOWN";

class LanguageDropdown extends Component {
  constructor(props) {
    super(props);

    this.state = {
      listVisible: false
    };
  }

  selectItem = item => {
    this.props.onSelectLanguage(item);
  };

  show = () => {
    this.setState({ listVisible: true });
    document.addEventListener("click", this.hide);
  };

  hide = () => {
    this.setState({ listVisible: false });
    document.removeEventListener("click", this.hide);
  };

  getDropdownIcon = dir => {
    if (this.props.isStoryItemDropDown) {
      return dir === DROP_UP ? up_white : down_white;
    } else {
      return dir === DROP_UP ? up_gray : down_gray;
    }
  };

  getDropdownText = selected => {
    return this.props.isStoryItemDropDown ? selected.code : selected.name;
  };

  render = () => {
    return (
      <div className="dd-wrapper">
        <div className="dd-header" aria-haspopup="true" id="language-btn" onClick={this.show}>
          <div className="dd-header-title" aria-labelledby="language-btn">
            {this.getDropdownText(this.props.selected)}
          </div>
          {this.state.listVisible ? (
            <span>
              <img src={this.getDropdownIcon(DROP_UP)} aria-hidden={true} />
            </span>
          ) : (
            <span>
              <img src={this.getDropdownIcon(DROP_DOWN)} aria-hidden={true} />
            </span>
          )}
        </div>
        {this.state.listVisible && (
          <ul className="dd-list">
            {this.props.langOptions.map(item => (
              <li
                className="dd-list-item"
                key={item.code}
                onClick={() => this.selectItem(item)}
              >
                <span className="language-select-s">{item.name}</span>
                {item.selected && <img src={check} alt="Gray checkmark indicating currently selected language"/>}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  };
}

export default LanguageDropdown;

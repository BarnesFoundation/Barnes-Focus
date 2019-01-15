import React, { Component } from 'react';
import Modal from 'react-modal';
import { SNAP_LANGUAGE_PREFERENCE, SNAP_LANGUAGE_TRANSLATION } from './Constants';

/** 
 * 
*/
class LanguageDropdown extends Component {

    constructor(props) {
        super(props);

        this.state = {
            listVisible: false
        }
    }

    selectItem = (item) => {
        this.props.onSelectLanguage(item);
    }

    show = () => {
        this.setState({ listVisible: true });
        document.addEventListener("click", this.hide);
    }

    hide = () => {
        this.setState({ listVisible: false });
        document.removeEventListener("click", this.hide);
    }

    renderListItems = () => {
        var items = [];
        for (var i = 0; i < this.props.langOptions.length; i++) {
            var item = this.props.langOptions[i];
            items.push(
                <div key={item.code} onClick={() => this.selectItem(item)}>
                    <span style={{ paddingRight: 10 }}>{item.name} </span>{item.selected && <i class="fa fa-check" aria-hidden="true"></i>}
                </div>
            );
        }
        return items;
    }

    render = () => {
        return (
            <div className="dd-wrapper">
                <div className="dd-header" onClick={this.show}>
                    <div className="dd-header-title">
                        {this.props.selected.code}
                    </div>
                    {this.state.listVisible
                        ? <i className="fa fa-angle-down"></i>
                        : <i className="fa fa-angle-up"></i>
                    }
                </div>
                {this.state.listVisible && <ul className="dd-list">
                    {this.props.langOptions.map((item) => (
                        <li className="dd-list-item" key={item.code} onClick={() => this.selectItem(item)}>
                            <span style={{ paddingRight: 10 }}>{item.name} </span>{item.selected && <i className="fa fa-check" aria-hidden="true"></i>}
                        </li>
                    ))}
                </ul>}
            </div>

        );
    }


}

export default LanguageDropdown;
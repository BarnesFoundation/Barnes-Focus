import React, { Component } from 'react';
import dropdown_icon from 'images/dropdown.svg';
import dropup_icon from 'images/dropup.svg';
import check from 'images/check.svg';

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
        this.props.onShowLanguageDropdown(true);
        document.addEventListener("click", this.hide);
    }

    hide = () => {
        this.setState({ listVisible: false });
        this.props.onShowLanguageDropdown(false);
        document.removeEventListener("click", this.hide);
    }

    render = () => {
        return (
            <div className="dd-wrapper">
                <div className="dd-header" onClick={this.show}>
                    <div className="dd-header-title">
                        {this.props.selected.code}
                    </div>
                    {this.state.listVisible
                        ? <span><img src={dropup_icon} /></span>
                        : <span><img src={dropdown_icon} /></span>
                    }
                </div>
                {this.state.listVisible && <ul className="dd-list">
                    {this.props.langOptions.map((item) => (
                        <li className="dd-list-item" key={item.code} onClick={() => this.selectItem(item)}>
                            <span>{item.name}</span>{item.selected && <img src={check} />}
                        </li>
                    ))}
                </ul>}
            </div>

        );
    }


}

export default LanguageDropdown;
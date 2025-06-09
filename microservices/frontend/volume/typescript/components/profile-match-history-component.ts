import { MatchHistory } from "../types/User";

class ProfileMatchHistoryComponent extends HTMLElement {
	history: MatchHistory;
	constructor(matchHistory: MatchHistory) {
		super();
		this.history = matchHistory;
	}

	connectedCallback() {}
	disconnectedCallback() {}
}

customElements.define(
	"profile-match-history-component",
	ProfileMatchHistoryComponent,
);

export { ProfileMatchHistoryComponent };

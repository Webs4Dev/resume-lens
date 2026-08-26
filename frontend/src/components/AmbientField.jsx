// Sits behind every page: two slow-drifting blurred orbs (violet +
// cyan, the brand accents) over a faint dot-grid "scan surface".
// Fixed + pointer-events:none so it never interferes with the UI.
export default function AmbientField() {
    return (
        <div className="ambient-field" aria-hidden="true">
            <div className="ambient-grid" />
            <span className="ambient-orb ambient-orb-violet" />
            <span className="ambient-orb ambient-orb-cyan" />
        </div>
    );
}

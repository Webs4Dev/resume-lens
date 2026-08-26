// Two counter-rotating rings + a pulsing core, standing in for the
// old plain spinner — reads as the lens "scanning" the resume.
export default function ScanLoader() {
    return (
        <div className="scan-loader" role="status" aria-label="Analyzing">
            <div className="scan-loader-ring" />
            <div className="scan-loader-ring scan-loader-ring-2" />
            <div className="scan-loader-core" />
        </div>
    );
}

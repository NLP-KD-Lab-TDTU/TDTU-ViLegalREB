import React from 'react';

interface FlowConnectorProps {
  d: string;
  arrow?: boolean;
}

/**
 * Dual-layer SVG connector pairing a subtle static guide spine with a
 * directional marching-dash overlay drawn along `d` (source -> target).
 */
const FlowConnector: React.FC<FlowConnectorProps> = ({ d, arrow = true }) => (
  <>
    <path
      d={d}
      fill="none"
      stroke="#cbd5e1"
      strokeWidth={1.75}
      strokeLinejoin="round"
      markerEnd={arrow ? 'url(#pipeline-arrow)' : undefined}
    />
    <path
      d={d}
      fill="none"
      stroke="#2563eb"
      strokeOpacity={0.85}
      strokeWidth={1.85}
      strokeLinecap="butt"
      strokeLinejoin="round"
      className="pipeline-flow-line"
    />
  </>
);

/**
 * Redrawn publication-grade SVG diagram of the 7-stage TDTU-ViLegalREB
 * benchmark construction pipeline. All coordinates are explicit (no CSS
 * transforms) so rendering stays crisp across all viewports.
 */
export const ConstructionPipelineDiagram: React.FC = () => {
  return (
    <div className="construction-figure-scroll">
      <svg
        className="construction-pipeline-svg"
        viewBox="0 0 920 936"
        role="img"
        aria-label="TDTU-ViLegalREB 7-stage benchmark construction pipeline flowing from citizen Q&A and statutory corpus collection through legal grounds extraction, query reformulation, hybrid candidate mining, tri-model re-grading, blind review, and joint adjudication to yield 143 queries and 6,131 graded qrels."
      >
        <defs>
          <marker
            id="pipeline-arrow"
            markerWidth="9"
            markerHeight="9"
            refX="7"
            refY="4.5"
            orient="auto"
            markerUnits="userSpaceOnUse"
          >
            <path d="M 0.5 1.2 L 8.2 4.5 L 0.5 7.8 Z" fill="#2563eb" />
          </marker>
        </defs>

        {/* ================================================================
            STAGE 1: Data Collection & Preprocessing (Top-Left)
            ================================================================ */}
        <rect
          x={16}
          y={16}
          width={396}
          height={248}
          rx={10}
          fill="#ffffff"
          stroke="#cbd5e1"
          strokeWidth={1.5}
        />
        <text
          x={214}
          y={42}
          textAnchor="middle"
          fontFamily="var(--font-sans)"
          fontSize="13.5"
          fontWeight="700"
          fill="#0f172a"
        >
          1. Data Collection &amp; Preprocessing
        </text>
        <line x1={34} y1={56} x2={394} y2={56} stroke="#e2e8f0" strokeWidth={1} />

        {/* 1a. Citizen Q&A Source Card */}
        <rect
          x={34}
          y={72}
          width={168}
          height={166}
          rx={8}
          fill="#f8fafc"
          stroke="#e2e8f0"
          strokeWidth={1.25}
        />
        {/* Citizen icon */}
        <circle
          cx={118}
          cy={100}
          r={14}
          fill="#ffffff"
          stroke="#0f172a"
          strokeWidth={2}
        />
        <path
          d="M 92 140 C 92 120, 144 120, 144 140 Z"
          fill="#ffffff"
          stroke="#0f172a"
          strokeWidth={2}
          strokeLinejoin="round"
        />
        <text
          x={118}
          y={165}
          textAnchor="middle"
          fontFamily="var(--font-sans)"
          fontSize="13"
          fontWeight="600"
          fill="#0f172a"
        >
          Citizen Q&amp;A
        </text>
        <rect
          x={56}
          y={177}
          width={124}
          height={24}
          rx={5}
          fill="#fef9c3"
          stroke="#eab308"
          strokeWidth={1}
        />
        <text
          x={118}
          y={193}
          textAnchor="middle"
          fontFamily="var(--font-mono)"
          fontSize="11.5"
          fontWeight="600"
          fill="#0f172a"
        >
          1,100 records
        </text>
        <text
          x={118}
          y={222}
          textAnchor="middle"
          fontFamily="var(--font-mono)"
          fontSize="10.5"
          fill="#64748b"
        >
          pbgdpl.gov.vn
        </text>

        {/* 1b. Legal Corpus Source Card */}
        <rect
          x={226}
          y={72}
          width={168}
          height={166}
          rx={8}
          fill="#f8fafc"
          stroke="#e2e8f0"
          strokeWidth={1.25}
        />
        {/* Database cylinder icon */}
        <path
          d="M 284 96 V 130 C 284 136, 336 136, 336 130 V 96"
          fill="#ffffff"
          stroke="#0f172a"
          strokeWidth={2}
          strokeLinejoin="round"
        />
        <ellipse
          cx={310}
          cy={96}
          rx={26}
          ry={8.5}
          fill="#ffffff"
          stroke="#0f172a"
          strokeWidth={2}
        />
        <path
          d="M 284 108 C 284 114, 336 114, 336 108"
          fill="none"
          stroke="#0f172a"
          strokeWidth={1.75}
        />
        <path
          d="M 284 119 C 284 125, 336 125, 336 119"
          fill="none"
          stroke="#0f172a"
          strokeWidth={1.75}
        />
        <text
          x={310}
          y={165}
          textAnchor="middle"
          fontFamily="var(--font-sans)"
          fontSize="13"
          fontWeight="600"
          fill="#0f172a"
        >
          Legal Corpus
        </text>
        <rect
          x={248}
          y={177}
          width={124}
          height={24}
          rx={5}
          fill="#fef9c3"
          stroke="#eab308"
          strokeWidth={1}
        />
        <text
          x={310}
          y={193}
          textAnchor="middle"
          fontFamily="var(--font-mono)"
          fontSize="11.5"
          fontWeight="600"
          fill="#0f172a"
        >
          3.03M chunks
        </text>
        <text
          x={310}
          y={222}
          textAnchor="middle"
          fontFamily="var(--font-mono)"
          fontSize="10.5"
          fill="#64748b"
        >
          vbpl.vn (91,406 docs)
        </text>

        {/* ================================================================
            STAGE 2: Legal Grounds Extraction & Preliminary Grading (Mid-Left)
            ================================================================ */}
        <rect
          x={16}
          y={310}
          width={396}
          height={246}
          rx={10}
          fill="#ffffff"
          stroke="#cbd5e1"
          strokeWidth={1.5}
        />
        <text
          x={214}
          y={331}
          textAnchor="middle"
          fontFamily="var(--font-mono)"
          fontSize="10.5"
          fontWeight="700"
          fill="#64748b"
          letterSpacing="0.06em"
        >
          STAGE 2
        </text>

        {/* Arrows Stage 1 -> Stage 2.1 (drawn above Stage 2 frame so they stay continuous) */}
        <FlowConnector d="M 118 238 L 118 279 Q 118 287 126 287 L 142 287 Q 150 287 150 295 L 150 342" />
        <FlowConnector d="M 310 238 L 310 279 Q 310 287 302 287 L 286 287 Q 278 287 278 295 L 278 342" />

        <rect
          x={46}
          y={344}
          width={336}
          height={42}
          rx={6}
          fill="#f8fafc"
          stroke="#334155"
          strokeWidth={1.35}
        />
        <text
          x={214}
          y={370}
          textAnchor="middle"
          fontFamily="var(--font-sans)"
          fontSize="13"
          fontWeight="600"
          fill="#0f172a"
        >
          2.1 Legal Grounds Extraction
        </text>

        <FlowConnector d="M 214 386 L 214 412" />

        <rect
          x={46}
          y={414}
          width={336}
          height={42}
          rx={6}
          fill="#f8fafc"
          stroke="#334155"
          strokeWidth={1.35}
        />
        <text
          x={214}
          y={440}
          textAnchor="middle"
          fontFamily="var(--font-sans)"
          fontSize="13"
          fontWeight="600"
          fill="#0f172a"
        >
          2.2 Preliminary Grading
        </text>

        <FlowConnector d="M 214 456 L 214 484" />

        <rect
          x={96}
          y={486}
          width={236}
          height={30}
          rx={6}
          fill="#fef9c3"
          stroke="#eab308"
          strokeWidth={1}
        />
        <text
          x={214}
          y={505}
          textAnchor="middle"
          fontFamily="var(--font-mono)"
          fontSize="12"
          fontWeight="600"
          fill="#0f172a"
        >
          241 fully mapped inquiries
        </text>
        <text
          x={196}
          y={538}
          textAnchor="end"
          fontFamily="var(--font-sans)"
          fontSize="10.5"
          fill="#64748b"
        >
          DeepSeek v4.1 Flash
        </text>
        <text
          x={232}
          y={538}
          textAnchor="start"
          fontFamily="var(--font-sans)"
          fontSize="10.5"
          fill="#64748b"
        >
          859 excluded
        </text>

        {/* ================================================================
            STAGE 3: Query Reformulation & Tri-Model Approval (Bottom-Left)
            ================================================================ */}
        <rect
          x={16}
          y={602}
          width={396}
          height={314}
          rx={10}
          fill="#ffffff"
          stroke="#cbd5e1"
          strokeWidth={1.5}
        />
        <text
          x={34}
          y={623}
          textAnchor="start"
          fontFamily="var(--font-mono)"
          fontSize="10.5"
          fontWeight="700"
          fill="#64748b"
          letterSpacing="0.06em"
        >
          STAGE 3 · QUERY FILTERING
        </text>

        {/* Arrow Stage 2 outcome -> Stage 3.1 */}
        <FlowConnector d="M 214 516 L 214 636" />

        <rect
          x={46}
          y={638}
          width={336}
          height={42}
          rx={6}
          fill="#f8fafc"
          stroke="#334155"
          strokeWidth={1.35}
        />
        <text
          x={214}
          y={664}
          textAnchor="middle"
          fontFamily="var(--font-sans)"
          fontSize="13"
          fontWeight="600"
          fill="#0f172a"
        >
          3.1 Query Reformulation
        </text>

        <FlowConnector d="M 214 680 L 214 704" />

        <rect
          x={46}
          y={706}
          width={336}
          height={42}
          rx={6}
          fill="#f8fafc"
          stroke="#334155"
          strokeWidth={1.35}
        />
        <text
          x={214}
          y={732}
          textAnchor="middle"
          fontFamily="var(--font-sans)"
          fontSize="13"
          fontWeight="600"
          fill="#0f172a"
        >
          3.2 Tri-Model Approval
        </text>

        <FlowConnector d="M 214 748 L 214 763" />

        {/* Grouped outputs of Stage 3 */}
        <rect
          x={74}
          y={765}
          width={280}
          height={102}
          rx={8}
          fill="#f8fafc"
          stroke="#e2e8f0"
          strokeWidth={1.25}
        />
        <rect
          x={96}
          y={776}
          width={236}
          height={30}
          rx={6}
          fill="#fef9c3"
          stroke="#eab308"
          strokeWidth={1}
        />
        <text
          x={214}
          y={795}
          textAnchor="middle"
          fontFamily="var(--font-mono)"
          fontSize="12"
          fontWeight="600"
          fill="#0f172a"
        >
          867 query-provision pairs
        </text>

        <rect
          x={96}
          y={822}
          width={236}
          height={30}
          rx={6}
          fill="#fef9c3"
          stroke="#eab308"
          strokeWidth={1}
        />
        <text
          x={214}
          y={841}
          textAnchor="middle"
          fontFamily="var(--font-mono)"
          fontSize="12"
          fontWeight="600"
          fill="#0f172a"
        >
          143 accepted queries
        </text>

        <text
          x={214}
          y={892}
          textAnchor="middle"
          fontFamily="var(--font-sans)"
          fontSize="10.5"
          fill="#64748b"
        >
          Unanimous 3/3 audit · 98 queries rejected
        </text>

        {/* ================================================================
            STAGE 4: Candidate Mining & Preliminary Grading (Bottom-Right)
            ================================================================ */}
        <rect
          x={508}
          y={602}
          width={396}
          height={314}
          rx={10}
          fill="#ffffff"
          stroke="#cbd5e1"
          strokeWidth={1.5}
        />
        <text
          x={526}
          y={623}
          textAnchor="start"
          fontFamily="var(--font-mono)"
          fontSize="10.5"
          fontWeight="700"
          fill="#64748b"
          letterSpacing="0.06em"
        >
          STAGE 4 · HYBRID MINING
        </text>

        {/* Mined pairs outcome pill */}
        <rect
          x={588}
          y={638}
          width={236}
          height={30}
          rx={6}
          fill="#fef9c3"
          stroke="#eab308"
          strokeWidth={1}
        />
        <text
          x={706}
          y={657}
          textAnchor="middle"
          fontFamily="var(--font-mono)"
          fontSize="12"
          fontWeight="600"
          fill="#0f172a"
        >
          5,264 query-provision pairs
        </text>

        {/* Arrow 4.2 -> 5,264 */}
        <FlowConnector d="M 706 698 L 706 670" />

        {/* 4.2 Preliminary Grading */}
        <rect
          x={538}
          y={698}
          width={336}
          height={42}
          rx={6}
          fill="#f8fafc"
          stroke="#334155"
          strokeWidth={1.35}
        />
        <text
          x={706}
          y={724}
          textAnchor="middle"
          fontFamily="var(--font-sans)"
          fontSize="13"
          fontWeight="600"
          fill="#0f172a"
        >
          4.2 Preliminary Grading
        </text>

        {/* Merge bracket 4.1a & 4.1b -> 4.2 (two upward streams merging at center) */}
        <FlowConnector d="M 614 814 L 614 786 Q 614 776 624 776 L 706 776" arrow={false} />
        <FlowConnector d="M 798 814 L 798 786 Q 798 776 788 776 L 706 776" arrow={false} />
        <FlowConnector d="M 706 776 L 706 742" />

        {/* 4.1a BM25 & 4.1b Dense */}
        <rect
          x={538}
          y={814}
          width={152}
          height={44}
          rx={6}
          fill="#f8fafc"
          stroke="#334155"
          strokeWidth={1.35}
        />
        <text
          x={614}
          y={841}
          textAnchor="middle"
          fontFamily="var(--font-sans)"
          fontSize="13"
          fontWeight="600"
          fill="#0f172a"
        >
          4.1a BM25
        </text>

        <rect
          x={722}
          y={814}
          width={152}
          height={44}
          rx={6}
          fill="#f8fafc"
          stroke="#334155"
          strokeWidth={1.35}
        />
        <text
          x={798}
          y={841}
          textAnchor="middle"
          fontFamily="var(--font-sans)"
          fontSize="13"
          fontWeight="600"
          fill="#0f172a"
        >
          4.1b Dense
        </text>

        {/* Routing: 143 accepted queries -> 4.1a BM25 and 4.1b Dense */}
        <FlowConnector d="M 332 837 L 536 837" />
        <FlowConnector d="M 474 837 L 474 876 Q 474 886 484 886 L 788 886 Q 798 886 798 876 L 798 860" />
        <circle cx={474} cy={837} r={3} fill="#2563eb" />

        {/* ================================================================
            STAGE 5: Tri-Model Re-grading (Mid-Right)
            ================================================================ */}
        <rect
          x={508}
          y={354}
          width={396}
          height={202}
          rx={10}
          fill="#ffffff"
          stroke="#cbd5e1"
          strokeWidth={1.5}
        />

        {/* Arrow Stage 4 (5,264) -> Stage 5 */}
        <FlowConnector d="M 706 638 L 706 536" />

        {/* Routing: Stage 3 (867 pairs) -> Stage 5 */}
        <FlowConnector d="M 332 791 L 448 791 Q 458 791 458 781 L 458 523 Q 458 513 468 513 L 536 513" />

        {/* 5. Tri-Model Re-grading */}
        <rect
          x={538}
          y={492}
          width={336}
          height={42}
          rx={6}
          fill="#f8fafc"
          stroke="#334155"
          strokeWidth={1.35}
        />
        <text
          x={706}
          y={518}
          textAnchor="middle"
          fontFamily="var(--font-sans)"
          fontSize="13"
          fontWeight="600"
          fill="#0f172a"
        >
          5. Tri-Model Re-grading
        </text>

        <FlowConnector d="M 706 492 L 706 464" />

        {/* Pooled total pill */}
        <rect
          x={588}
          y={434}
          width={236}
          height={28}
          rx={6}
          fill="#fef9c3"
          stroke="#eab308"
          strokeWidth={1}
        />
        <text
          x={706}
          y={452}
          textAnchor="middle"
          fontFamily="var(--font-mono)"
          fontSize="12"
          fontWeight="600"
          fill="#0f172a"
        >
          6,131 query-provision pairs
        </text>

        {/* Fork from 6,131 -> Left audit subset & Right consensus stream */}
        <FlowConnector
          d="M 706 434 L 706 424 Q 706 419 701 419 L 631 419 Q 626 419 626 414 L 626 402"
          arrow={false}
        />
        <FlowConnector
          d="M 706 434 L 706 424 Q 706 419 711 419 L 813 419 Q 818 419 818 414 L 818 402"
          arrow={false}
        />

        {/* Audited subset badge (469 pairs) */}
        <rect
          x={524}
          y={370}
          width={204}
          height={32}
          rx={6}
          fill="#f8fafc"
          stroke="#cbd5e1"
          strokeWidth={1.15}
        />
        <rect
          x={529}
          y={375}
          width={88}
          height={22}
          rx={4}
          fill="#fef2f2"
          stroke="#fecaca"
          strokeWidth={1}
        />
        <text
          x={573}
          y={389.5}
          textAnchor="middle"
          fontFamily="var(--font-mono)"
          fontSize="10.5"
          fontWeight="600"
          fill="#b91c1c"
        >
          169 conflict
        </text>
        <text
          x={623}
          y={390}
          textAnchor="middle"
          fontFamily="var(--font-sans)"
          fontSize="11"
          fontWeight="700"
          fill="#64748b"
        >
        </text>
        <rect
          x={629}
          y={375}
          width={94}
          height={22}
          rx={4}
          fill="#f0fdf4"
          stroke="#bbf7d0"
          strokeWidth={1}
        />
        <text
          x={676}
          y={389.5}
          textAnchor="middle"
          fontFamily="var(--font-mono)"
          fontSize="10.5"
          fontWeight="600"
          fill="#15803d"
        >
          300 consensus
        </text>

        {/* Remaining consensus badge (5,662 pairs) */}
        <rect
          x={746}
          y={370}
          width={144}
          height={32}
          rx={6}
          fill="#f8fafc"
          stroke="#cbd5e1"
          strokeWidth={1.15}
        />
        <text
          x={818}
          y={390}
          textAnchor="middle"
          fontFamily="var(--font-mono)"
          fontSize="11"
          fontWeight="600"
          fill="#334155"
        >
          5,662 consensus
        </text>

        {/* ================================================================
            STAGES 6–7 & FINAL BENCHMARK (Top-Right)
            ================================================================ */}
        <rect
          x={508}
          y={16}
          width={396}
          height={294}
          rx={10}
          fill="#ffffff"
          stroke="#cbd5e1"
          strokeWidth={1.5}
        />
        <text
          x={706}
          y={42}
          textAnchor="middle"
          fontFamily="var(--font-sans)"
          fontSize="13.5"
          fontWeight="700"
          fill="#0f172a"
        >
          Final Benchmark
        </text>

        {/* Final benchmark hero box */}
        <rect
          x={536}
          y={58}
          width={340}
          height={68}
          rx={8}
          fill="#eff6ff"
          stroke="#2563eb"
          strokeWidth={1.75}
          strokeDasharray="6 4"
        />
        <text
          x={706}
          y={87}
          textAnchor="middle"
          fontFamily="var(--font-mono)"
          fontSize="13.5"
          fontWeight="700"
          fill="#0f172a"
        >
          143 queries · 6,131 graded qrels
        </text>
        <text
          x={706}
          y={109}
          textAnchor="middle"
          fontFamily="var(--font-sans)"
          fontSize="11.5"
          fontWeight="600"
          fill="#1d4ed8"
        >
          27 categories · 3-grade relevance scale
        </text>

        {/* Left track: Audited subset -> 6. Blind Review -> 7. Joint Adjudication -> Final */}
        <FlowConnector d="M 626 370 L 626 286" />
        <rect
          x={536}
          y={240}
          width={180}
          height={44}
          rx={6}
          fill="#f8fafc"
          stroke="#334155"
          strokeWidth={1.35}
        />
        <text
          x={626}
          y={267}
          textAnchor="middle"
          fontFamily="var(--font-sans)"
          fontSize="12.5"
          fontWeight="600"
          fill="#0f172a"
        >
          6. Blind Review
        </text>

        <FlowConnector d="M 626 240 L 626 204" />
        <rect
          x={536}
          y={158}
          width={180}
          height={44}
          rx={6}
          fill="#f8fafc"
          stroke="#334155"
          strokeWidth={1.35}
        />
        <text
          x={626}
          y={185}
          textAnchor="middle"
          fontFamily="var(--font-sans)"
          fontSize="12.5"
          fontWeight="600"
          fill="#0f172a"
        >
          7. Joint Adjudication
        </text>

        <FlowConnector d="M 626 158 L 626 128" />

        {/* Right track: Consensus bypass -> Final */}
        <FlowConnector d="M 818 370 L 818 128" />
        <rect
          x={760}
          y={208}
          width={116}
          height={24}
          rx={12}
          fill="#ffffff"
          stroke="#cbd5e1"
          strokeWidth={1.15}
        />
        <text
          x={818}
          y={223.5}
          textAnchor="middle"
          fontFamily="var(--font-sans)"
          fontSize="10.5"
          fontWeight="600"
          fill="#475569"
        >
          Consensus pass
        </text>
      </svg>
    </div>
  );
};


import type { AgentMdxComponentDocs } from "@/lib/agent-mdx-component-docs";

export type SharedProps = {
  /** Optional text for the fixture component. */
  label?: string;

  /** Optional number for the fixture component. */
  number?: number;
};

export function InlineProps(_props: { /** Inline props are unsupported. */ label?: string }) {
  void _props;
  return null;
}

type PrivateRootProps = {
  /** A private root prop. */
  label?: string;
};

export function PrivateRoot(_props: PrivateRootProps) {
  void _props;
  return null;
}

export const privateRootMdxDocs = {
  description: "A private root props fixture.",
  flow: "inline",
  defaults: {},
  examples: [{ title: "Private root", mdx: "<PrivateRoot />" }],
} as const satisfies AgentMdxComponentDocs<PrivateRootProps>;

export type OverloadedProps = {
  /** A prop for the overloaded fixture. */
  label?: string;
};

export function Overloaded(_props: OverloadedProps): null;
export function Overloaded(_props: OverloadedProps, _label?: string): null;
export function Overloaded(..._args: unknown[]) {
  void _args;
  return null;
}

type PrivateNested = {
  /** A private nested prop. */
  label: string;
};

export type PrivateNestedProps = {
  /** A nested object that is deliberately private. */
  nested?: PrivateNested;
};

export function PrivateNestedComponent(_props: PrivateNestedProps) {
  void _props;
  return null;
}

export const privateNestedComponentMdxDocs = {
  description: "A private nested props fixture.",
  flow: "block",
  defaults: {},
  examples: [{ title: "Private nested", mdx: "<PrivateNestedComponent />" }],
} as const satisfies AgentMdxComponentDocs<PrivateNestedProps>;

export type MissingDocsProps = {
  label?: string;
};

export function MissingDocs(_props: MissingDocsProps) {
  void _props;
  return null;
}

export const missingDocsMdxDocs = {
  description: "A missing JSDoc fixture.",
  flow: "inline",
  defaults: {},
  examples: [{ title: "Missing docs", mdx: "<MissingDocs />" }],
} as const satisfies AgentMdxComponentDocs<MissingDocsProps>;

export interface BaseInterfaceProps {
  /** A value inherited from the base interface. */
  base: string;
}

export interface NestedInterfaceProps {
  /** A nested value from the nested interface. */
  value: string;
}

export interface ExtendedInterfaceProps extends BaseInterfaceProps {
  /** A project-local nested interface. */
  nested?: NestedInterfaceProps;
}

export function ExtendedInterface(_props: ExtendedInterfaceProps) {
  void _props;
  return null;
}

export const extendedInterfaceMdxDocs = {
  description: "An interface inheritance fixture.",
  flow: "block",
  defaults: {},
  examples: [{ title: "Extended interface", mdx: "<ExtendedInterface base=\"Base\" />" }],
} as const satisfies AgentMdxComponentDocs<ExtendedInterfaceProps>;

const sharedMetadata = {};

export function MetadataSpread(_props: SharedProps) {
  void _props;
  return null;
}

export const metadataSpreadMdxDocs = {
  ...sharedMetadata,
  description: "A metadata spread fixture.",
  flow: "inline",
  defaults: {},
  examples: [{ title: "Metadata spread", mdx: "<MetadataSpread />" }],
} as const satisfies AgentMdxComponentDocs<SharedProps>;

export function ComputedMetadata(_props: SharedProps) {
  void _props;
  return null;
}

export const computedMetadataMdxDocs = {
  ["description"]: "A computed metadata fixture.",
  flow: "inline",
  defaults: {},
  examples: [{ title: "Computed metadata", mdx: "<ComputedMetadata />" }],
} as const satisfies AgentMdxComponentDocs<SharedProps>;

const description = "A shorthand metadata fixture.";

export function ShorthandMetadata(_props: SharedProps) {
  void _props;
  return null;
}

export const shorthandMetadataMdxDocs = {
  description,
  flow: "inline",
  defaults: {},
  examples: [{ title: "Shorthand metadata", mdx: "<ShorthandMetadata />" }],
} as const satisfies AgentMdxComponentDocs<SharedProps>;

function createDescription() {
  return "A callable metadata fixture.";
}

export function CallableMetadata(_props: SharedProps) {
  void _props;
  return null;
}

export const callableMetadataMdxDocs = {
  description: createDescription(),
  flow: "inline",
  defaults: {},
  examples: [{ title: "Callable metadata", mdx: "<CallableMetadata />" }],
} as const satisfies AgentMdxComponentDocs<SharedProps>;

const descriptionSource = { description: "A property-read metadata fixture." };

export function PropertyReadMetadata(_props: SharedProps) {
  void _props;
  return null;
}

export const propertyReadMetadataMdxDocs = {
  description: descriptionSource.description,
  flow: "inline",
  defaults: {},
  examples: [{ title: "Property read metadata", mdx: "<PropertyReadMetadata />" }],
} as const satisfies AgentMdxComponentDocs<SharedProps>;

const sharedExample = {};

export function ExampleSpread(_props: SharedProps) {
  void _props;
  return null;
}

export const exampleSpreadMdxDocs = {
  description: "An example spread fixture.",
  flow: "inline",
  defaults: {},
  examples: [{ ...sharedExample, title: "Example spread", mdx: "<ExampleSpread />" }],
} as const satisfies AgentMdxComponentDocs<SharedProps>;

export function InvalidUnaryDefaults(_props: SharedProps) {
  void _props;
  return null;
}

export const invalidUnaryDefaultsMdxDocs = {
  description: "An invalid unary defaults fixture.",
  flow: "inline",
  // @ts-expect-error This fixture must use an invalid unary default.
  defaults: { number: !1 },
  examples: [{ title: "Invalid unary", mdx: "<InvalidUnaryDefaults />" }],
} as const satisfies AgentMdxComponentDocs<SharedProps>;

export type StaticUnaryProps = {
  /** A positive numeric default. */
  positive?: number;

  /** A negative numeric default. */
  negative?: number;
};

export function StaticUnaryDefaults(_props: StaticUnaryProps) {
  void _props;
  return null;
}

export const staticUnaryDefaultsMdxDocs = {
  description: "A valid unary defaults fixture.",
  flow: "inline",
  defaults: { positive: +1, negative: -1 },
  examples: [{ title: "Static unary", mdx: "<StaticUnaryDefaults />" }],
} as const satisfies AgentMdxComponentDocs<StaticUnaryProps>;

export function PrivateMetadata(_props: SharedProps) {
  void _props;
  return null;
}

const privateMetadataMdxDocs = {
  description: "A private metadata fixture.",
  flow: "inline",
  defaults: {},
  examples: [{ title: "Private metadata", mdx: "<PrivateMetadata />" }],
} as const satisfies AgentMdxComponentDocs<SharedProps>;

void privateMetadataMdxDocs;

export function InvalidFlow(_props: SharedProps) {
  void _props;
  return null;
}

export const invalidFlowMdxDocs = {
  description: "An invalid flow fixture.",
  // @ts-expect-error This fixture must use an invalid flow value.
  flow: "sideways",
  defaults: {},
  examples: [{ title: "Invalid flow", mdx: "<InvalidFlow />" }],
} as const satisfies AgentMdxComponentDocs<SharedProps>;

export function NoExamples(_props: SharedProps) {
  void _props;
  return null;
}

export const noExamplesMdxDocs = {
  description: "A no-examples fixture.",
  flow: "inline",
  defaults: {},
  // @ts-expect-error This fixture must have no examples.
  examples: [],
} as const satisfies AgentMdxComponentDocs<SharedProps>;

export function ManyExamples(_props: SharedProps) {
  void _props;
  return null;
}

export const manyExamplesMdxDocs = {
  description: "A many-examples fixture.",
  flow: "inline",
  defaults: {},
  // @ts-expect-error This fixture must have three examples.
  examples: [
    { title: "One", mdx: "<ManyExamples />" },
    { title: "Two", mdx: "<ManyExamples />" },
    { title: "Three", mdx: "<ManyExamples />" },
  ],
} as const satisfies AgentMdxComponentDocs<SharedProps>;

export function DuplicateExamples(_props: SharedProps) {
  void _props;
  return null;
}

export const duplicateExamplesMdxDocs = {
  description: "A duplicate-title fixture.",
  flow: "inline",
  defaults: {},
  examples: [
    { title: "Repeated", mdx: "<DuplicateExamples />" },
    { title: "Repeated", mdx: "<DuplicateExamples label=\"two\" />" },
  ],
} as const satisfies AgentMdxComponentDocs<SharedProps>;

export function UntypedMetadata(_props: SharedProps) {
  void _props;
  return null;
}

export const untypedMetadataMdxDocs = {
  description: "An untyped metadata fixture.",
  flow: "inline",
  defaults: {},
  examples: [{ title: "Untyped metadata", mdx: "<UntypedMetadata />" }],
};

export function WrongContract(_props: SharedProps) {
  void _props;
  return null;
}

export const wrongContractMdxDocs = {
  description: "A wrong-contract fixture.",
  flow: "inline",
  defaults: {},
  examples: [{ title: "Wrong contract", mdx: "<WrongContract />" }],
} as const satisfies {
  description: string;
  flow: "inline" | "block";
  defaults: object;
  examples: readonly { title: string; mdx: string }[];
};

export type WrongComponentProps = {
  /** The component's actual prop. */
  label?: string;
};

export type WrongMetadataProps = {
  /** A structurally compatible but different prop. */
  label?: string;
};

export function WrongProps(_props: WrongComponentProps) {
  void _props;
  return null;
}

export const wrongPropsMdxDocs = {
  description: "A wrong-props fixture.",
  flow: "inline",
  defaults: {},
  examples: [{ title: "Wrong props", mdx: "<WrongProps />" }],
} as const satisfies AgentMdxComponentDocs<WrongMetadataProps>;

const typeQueryValues = { simple: "simple" };

void typeQueryValues;

export type TypeQueryProps = {
  /** A project-local type query. */
  value?: keyof typeof typeQueryValues;
};

export function TypeQuery(_props: TypeQueryProps) {
  void _props;
  return null;
}

export const typeQueryMdxDocs = {
  description: "A type-query fixture.",
  flow: "inline",
  defaults: {},
  examples: [{ title: "Type query", mdx: "<TypeQuery />" }],
} as const satisfies AgentMdxComponentDocs<TypeQueryProps>;

export type FamilyRootProps = {
  /** Optional label for the family root. */
  label?: string;
};

export type FamilyPartProps = {
  /** Optional text for the family part. */
  text?: string;
};

export function FamilyRoot(_props: FamilyRootProps) {
  void _props;
  return null;
}

export function FamilyPart(_props: FamilyPartProps) {
  void _props;
  return null;
}

export const familyRootMdxDocs = {
  description: "A family root fixture.",
  flow: "block",
  defaults: {},
  family: [{ name: "FamilyPart", required: true }],
  guidance: ["Place FamilyPart directly inside FamilyRoot."],
  examples: [{ title: "Complete family", mdx: "<FamilyRoot><FamilyPart /></FamilyRoot>" }],
} as const satisfies AgentMdxComponentDocs<FamilyRootProps>;

export const familyPartMdxDocs = {
  description: "A family member fixture.",
  flow: "block",
  defaults: {},
  examples: [{ title: "Family part", mdx: "<FamilyRoot><FamilyPart /></FamilyRoot>" }],
} as const satisfies AgentMdxComponentDocs<FamilyPartProps>;

const familyMemberName = "FamilyPart";
const familyMemberRequired = true;
const familyMemberBase = { name: "FamilyPart", required: true };
const familyMembers = [familyMemberBase] as const;

export function FamilyMissingRequired(_props: SharedProps) {
  void _props;
  return null;
}

export const familyMissingRequiredMdxDocs = {
  description: "A family fixture with missing required metadata.",
  flow: "block",
  defaults: {},
  // @ts-expect-error This fixture omits the required field.
  family: [{ name: "FamilyPart" }],
  guidance: ["Use the root with its family members."],
  examples: [{ title: "Missing required", mdx: "<FamilyMissingRequired><FamilyPart /></FamilyMissingRequired>" }],
} as const satisfies AgentMdxComponentDocs<SharedProps>;

export function FamilyExtraField(_props: SharedProps) {
  void _props;
  return null;
}

export const familyExtraFieldMdxDocs = {
  description: "A family fixture with an extra metadata field.",
  flow: "block",
  defaults: {},
  // @ts-expect-error This fixture adds an unsupported field.
  family: [{ name: "FamilyPart", required: true, extra: "unsupported" }],
  guidance: ["Use the root with its family members."],
  examples: [{ title: "Extra field", mdx: "<FamilyExtraField><FamilyPart /></FamilyExtraField>" }],
} as const satisfies AgentMdxComponentDocs<SharedProps>;

export function FamilyComputedField(_props: SharedProps) {
  void _props;
  return null;
}

export const familyComputedFieldMdxDocs = {
  description: "A family fixture with a computed metadata field.",
  flow: "block",
  defaults: {},
  family: [{ name: "FamilyPart", ["required"]: true }],
  guidance: ["Use the root with its family members."],
  examples: [{ title: "Computed field", mdx: "<FamilyComputedField><FamilyPart /></FamilyComputedField>" }],
} as const satisfies AgentMdxComponentDocs<SharedProps>;

export function FamilySpread(_props: SharedProps) {
  void _props;
  return null;
}

export const familySpreadMdxDocs = {
  description: "A family fixture with a spread metadata field.",
  flow: "block",
  defaults: {},
  family: [{ ...familyMemberBase }],
  guidance: ["Use the root with its family members."],
  examples: [{ title: "Spread field", mdx: "<FamilySpread><FamilyPart /></FamilySpread>" }],
} as const satisfies AgentMdxComponentDocs<SharedProps>;

export function FamilyNonliteralName(_props: SharedProps) {
  void _props;
  return null;
}

export const familyNonliteralNameMdxDocs = {
  description: "A family fixture with a nonliteral name.",
  flow: "block",
  defaults: {},
  family: [{ name: familyMemberName, required: true }],
  guidance: ["Use the root with its family members."],
  examples: [{ title: "Nonliteral name", mdx: "<FamilyNonliteralName><FamilyPart /></FamilyNonliteralName>" }],
} as const satisfies AgentMdxComponentDocs<SharedProps>;

export function FamilyNonliteralRequired(_props: SharedProps) {
  void _props;
  return null;
}

export const familyNonliteralRequiredMdxDocs = {
  description: "A family fixture with a nonliteral required value.",
  flow: "block",
  defaults: {},
  family: [{ name: "FamilyPart", required: familyMemberRequired }],
  guidance: ["Use the root with its family members."],
  examples: [{ title: "Nonliteral required", mdx: "<FamilyNonliteralRequired><FamilyPart /></FamilyNonliteralRequired>" }],
} as const satisfies AgentMdxComponentDocs<SharedProps>;

export function FamilyNonliteralArray(_props: SharedProps) {
  void _props;
  return null;
}

export const familyNonliteralArrayMdxDocs = {
  description: "A family fixture with a nonliteral family array.",
  flow: "block",
  defaults: {},
  family: familyMembers,
  guidance: ["Use the root with its family members."],
  examples: [{ title: "Nonliteral array", mdx: "<FamilyNonliteralArray><FamilyPart /></FamilyNonliteralArray>" }],
} as const satisfies AgentMdxComponentDocs<SharedProps>;

export function MissingMetadata(_props: SharedProps) {
  void _props;
  return null;
}

export const catalogInlineProps = { InlineProps };
export const catalogPrivateRoot = { PrivateRoot };
export const catalogOverloaded = { Overloaded };
export const catalogPrivateNested = { PrivateNestedComponent };
export const catalogMissingDocs = { MissingDocs };
export const catalogExtendedInterface = { ExtendedInterface };
export const catalogMetadataSpread = { MetadataSpread };
export const catalogComputedMetadata = { ComputedMetadata };
export const catalogShorthandMetadata = { ShorthandMetadata };
export const catalogCallableMetadata = { CallableMetadata };
export const catalogPropertyReadMetadata = { PropertyReadMetadata };
export const catalogExampleSpread = { ExampleSpread };
export const catalogInvalidUnaryDefaults = { InvalidUnaryDefaults };
export const catalogStaticUnaryDefaults = { StaticUnaryDefaults };
export const catalogPrivateMetadata = { PrivateMetadata };
export const catalogInvalidFlow = { InvalidFlow };
export const catalogNoExamples = { NoExamples };
export const catalogManyExamples = { ManyExamples };
export const catalogDuplicateExamples = { DuplicateExamples };
export const catalogUntypedMetadata = { UntypedMetadata };
export const catalogWrongContract = { WrongContract };
export const catalogWrongProps = { WrongProps };
export const catalogTypeQuery = { TypeQuery };
export const catalogFamily = { FamilyRoot, FamilyPart };
export const catalogFamilyMissingRequired = { FamilyMissingRequired };
export const catalogFamilyExtraField = { FamilyExtraField };
export const catalogFamilyComputedField = { FamilyComputedField };
export const catalogFamilySpread = { FamilySpread };
export const catalogFamilyNonliteralName = { FamilyNonliteralName };
export const catalogFamilyNonliteralRequired = { FamilyNonliteralRequired };
export const catalogFamilyNonliteralArray = { FamilyNonliteralArray };
export const catalogMissingMetadata = { MissingMetadata };
export const catalogUnsafeName = { "../Reference": MissingMetadata };

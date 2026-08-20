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
  guidance: ["Place FamilyPart directly inside FamilyRoot."],
  examples: [{ title: "Complete family", mdx: "<FamilyRoot><FamilyPart /></FamilyRoot>" }],
} as const satisfies AgentMdxComponentDocs<FamilyRootProps>;

export const familyPartMdxDocs = {
  description: "A family member fixture.",
  flow: "block",
  defaults: {},
  examples: [{ title: "Family part", mdx: "<FamilyRoot><FamilyPart /></FamilyRoot>" }],
} as const satisfies AgentMdxComponentDocs<FamilyPartProps>;

export function MissingMetadata(_props: SharedProps) {
  void _props;
  return null;
}

export const catalogInlineProps = [{ title: "Fixture", capabilities: [{ root: "InlineProps", components: { InlineProps } }] }];
export const catalogPrivateRoot = [{ title: "Fixture", capabilities: [{ root: "PrivateRoot", components: { PrivateRoot } }] }];
export const catalogOverloaded = [{ title: "Fixture", capabilities: [{ root: "Overloaded", components: { Overloaded } }] }];
export const catalogPrivateNested = [{ title: "Fixture", capabilities: [{ root: "PrivateNestedComponent", components: { PrivateNestedComponent } }] }];
export const catalogMissingDocs = [{ title: "Fixture", capabilities: [{ root: "MissingDocs", components: { MissingDocs } }] }];
export const catalogExtendedInterface = [{ title: "Fixture", capabilities: [{ root: "ExtendedInterface", components: { ExtendedInterface } }] }];
export const catalogMetadataSpread = [{ title: "Fixture", capabilities: [{ root: "MetadataSpread", components: { MetadataSpread } }] }];
export const catalogComputedMetadata = [{ title: "Fixture", capabilities: [{ root: "ComputedMetadata", components: { ComputedMetadata } }] }];
export const catalogShorthandMetadata = [{ title: "Fixture", capabilities: [{ root: "ShorthandMetadata", components: { ShorthandMetadata } }] }];
export const catalogCallableMetadata = [{ title: "Fixture", capabilities: [{ root: "CallableMetadata", components: { CallableMetadata } }] }];
export const catalogPropertyReadMetadata = [{ title: "Fixture", capabilities: [{ root: "PropertyReadMetadata", components: { PropertyReadMetadata } }] }];
export const catalogExampleSpread = [{ title: "Fixture", capabilities: [{ root: "ExampleSpread", components: { ExampleSpread } }] }];
export const catalogInvalidUnaryDefaults = [{ title: "Fixture", capabilities: [{ root: "InvalidUnaryDefaults", components: { InvalidUnaryDefaults } }] }];
export const catalogStaticUnaryDefaults = [{ title: "Fixture", capabilities: [{ root: "StaticUnaryDefaults", components: { StaticUnaryDefaults } }] }];
export const catalogPrivateMetadata = [{ title: "Fixture", capabilities: [{ root: "PrivateMetadata", components: { PrivateMetadata } }] }];
export const catalogInvalidFlow = [{ title: "Fixture", capabilities: [{ root: "InvalidFlow", components: { InvalidFlow } }] }];
export const catalogNoExamples = [{ title: "Fixture", capabilities: [{ root: "NoExamples", components: { NoExamples } }] }];
export const catalogManyExamples = [{ title: "Fixture", capabilities: [{ root: "ManyExamples", components: { ManyExamples } }] }];
export const catalogDuplicateExamples = [{ title: "Fixture", capabilities: [{ root: "DuplicateExamples", components: { DuplicateExamples } }] }];
export const catalogUntypedMetadata = [{ title: "Fixture", capabilities: [{ root: "UntypedMetadata", components: { UntypedMetadata } }] }];
export const catalogWrongContract = [{ title: "Fixture", capabilities: [{ root: "WrongContract", components: { WrongContract } }] }];
export const catalogWrongProps = [{ title: "Fixture", capabilities: [{ root: "WrongProps", components: { WrongProps } }] }];
export const catalogTypeQuery = [{ title: "Fixture", capabilities: [{ root: "TypeQuery", components: { TypeQuery } }] }];
export const catalogFamily = [{ title: "Fixture", capabilities: [{ root: "FamilyRoot", components: { FamilyRoot, FamilyPart }, required: ["FamilyPart"] }] }];
export const catalogRootMissingFromComponents = [{ title: "Fixture", capabilities: [{ root: "Missing", components: { FamilyRoot } }] }];
export const catalogRootNotFirst = [{ title: "Fixture", capabilities: [{ root: "FamilyRoot", components: { FamilyPart, FamilyRoot } }] }];
export const catalogUnknownRequiredMember = [{ title: "Fixture", capabilities: [{ root: "FamilyRoot", components: { FamilyRoot, FamilyPart }, required: ["Missing"] }] }];
export const catalogDuplicateRoot = [{ title: "Fixture", capabilities: [{ root: "FamilyRoot", components: { FamilyRoot } }, { root: "FamilyRoot", components: { FamilyRoot } }] }];
export const catalogMismatchedSharedMember = [{ title: "Fixture", capabilities: [{ root: "FamilyRoot", components: { FamilyRoot, FamilyPart }, required: ["FamilyPart"] }, { root: "StaticUnaryDefaults", components: { StaticUnaryDefaults, FamilyPart: StaticUnaryDefaults } }] }];
export const catalogFamilyMissingGuidance = [{ title: "Fixture", capabilities: [{ root: "FamilyPart", components: { FamilyPart, FamilyRoot } }] }];
export const catalogFamilyIncompleteExample = [{ title: "Fixture", capabilities: [{ root: "FamilyRoot", components: { FamilyRoot, StaticUnaryDefaults } }] }];
export const catalogMissingMetadata = [{ title: "Fixture", capabilities: [{ root: "MissingMetadata", components: { MissingMetadata } }] }];
export const catalogUnsafeName = [{ title: "Fixture", capabilities: [{ root: "../Reference", components: { "../Reference": MissingMetadata } }] }];

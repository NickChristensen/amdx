type OptionalKeys<Value> = {
  [Key in keyof Value]-?: object extends Pick<Value, Key> ? Key : never;
}[keyof Value];

export type AgentMdxDefaults<Props> = Partial<Pick<Props, OptionalKeys<Props>>>;

export type AgentMdxExample = {
  title: string;
  mdx: string;
};

export type AgentMdxFamilyMember = {
  name: string;
  required: boolean;
};

export type AgentMdxComponentDocs<Props> = {
  description: string;
  flow: "inline" | "block";
  defaults: AgentMdxDefaults<Props>;
  family?: readonly [AgentMdxFamilyMember, ...AgentMdxFamilyMember[]];
  guidance?: readonly string[];
  examples:
    | readonly []
    | readonly [AgentMdxExample]
    | readonly [AgentMdxExample, AgentMdxExample];
};

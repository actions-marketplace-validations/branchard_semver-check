export type Alias<T> = T & {readonly __tag: unique symbol};

export type FilePath = Alias<string>;

export type ProjectName = Alias<string>;

export type Version = Alias<string>;

export type Infos = {
	name: ProjectName;
	version: Version;
};

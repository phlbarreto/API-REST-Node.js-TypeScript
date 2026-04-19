type PrismaBaseDelegate = {
  findMany(args: any): Promise<any>;
  findFirst(args: any): Promise<any>;
  findUnique(args: any): Promise<any>;
  create(args: { data: any }): Promise<any>;
  update(args: { where: any; data: any }): Promise<any>;
  delete(args: { where: any }): Promise<any>;
};

export class BaseModel<M extends PrismaBaseDelegate> {
  protected readonly model: M;

  constructor(model: M) {
    this.model = model;
  }

  protected async findMany(args: Parameters<M["findMany"]>[0]) {
    return this.model.findMany(args);
  }

  protected async findFirst(args: Parameters<M["findFirst"]>[0]) {
    return this.model.findFirst(args);
  }

  protected async createOne(data: Parameters<M["create"]>[0]["data"]) {
    return this.model.create({ data });
  }

  protected async updateOne(
    where: Parameters<M["update"]>[0]["where"],
    data: Parameters<M["update"]>[0]["data"],
  ) {
    return this.model.update({ where, data });
  }

  protected async deleteOneById(where: Parameters<M["delete"]>[0]["where"]) {
    return this.model.delete({ where });
  }
  
  protected async findUnique(args: Parameters<M["findUnique"]>[0]) {
    return this.model.findUnique(args);
  }
}

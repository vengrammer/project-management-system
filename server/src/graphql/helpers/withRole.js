export const withRole = (allowedRoles, resolverFn) => {
  return async (parent, args, context, info) => {
    const user = context.user;
    if (!user) throw new Error("Not authenticated");
    if (!allowedRoles.includes(user.role)) throw new Error("Not authorized");

    return await resolverFn(parent, args, context, info);
  };
};

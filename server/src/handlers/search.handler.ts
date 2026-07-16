import { SearchService } from "../services/search.service.js";
import { searchSchema } from "../validators/search.validator.js";
import { AuthSocket } from "../types/socket.js";

const searchService = new SearchService();

export const handleSearch = async (
  socket: AuthSocket,
  payload: any
) => {
  const result = searchSchema.safeParse(payload);

  if (!result.success) {
    socket.send(
      JSON.stringify({
        type: "error",
        message: "Invalid search payload",
      })
    );
    return;
  }

  const searchResult = await searchService.search(
    socket.userId!,
    result.data.query
  );

  socket.send(
    JSON.stringify({
      type: "searchResult",
      ...searchResult,
    })
  );
};
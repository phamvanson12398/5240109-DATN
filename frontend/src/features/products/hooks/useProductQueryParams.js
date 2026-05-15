import { useLocation, useNavigate, useParams } from "react-router-dom";

function useProductQueryParams() {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();

  const searchParams = new URLSearchParams(location.search);
  const keyword = searchParams.get("keyword") || params.keyword || "";
  const categoryFromURL = searchParams.get("category");
  const pageFromURL = parseInt(searchParams.get("page"), 10) || 1;

  const updatePageParam = (page) => {
    const newSearchParams = new URLSearchParams(location.search);

    if (page === 1) {
      newSearchParams.delete("page");
    } else {
      newSearchParams.set("page", page);
    }

    navigate(`?${newSearchParams.toString()}`);
  };

  const updateCategoryParam = (category, isRemoving) => {
    const newSearchParams = new URLSearchParams(location.search);
    newSearchParams.delete("page");

    if (isRemoving) {
      newSearchParams.delete("category");
    } else {
      newSearchParams.set("category", category);
    }

    navigate(`?${newSearchParams.toString()}`);
  };

  const clearProductQuery = () => {
    navigate("/products");
  };

  return {
    categoryFromURL,
    clearProductQuery,
    keyword,
    locationSearch: location.search,
    pageFromURL,
    updateCategoryParam,
    updatePageParam,
  };
}

export default useProductQueryParams;

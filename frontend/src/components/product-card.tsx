import { FaExpandAlt, FaPlus } from "react-icons/fa";
import { Link } from "react-router-dom";

interface ProductsProps {
  productId: string;
  photo: string;
  name: string;
  price: number;
  stock: number;
  handler: () => void;
}

const server = "asdasdasd";

const ProductCard = ({
  productId,
  photo,
  name,
  price,
  stock,
  handler,
}: ProductsProps) => {
  return (
    <div className="product-card">
      <img src={`${photo}`} alt={name} />
      <p>{name}</p>
      <span>₹{price}</span>

      <div>
        <button onClick={() => handler()}>
          <FaPlus />
        </button>

        <Link to={`/product/${productId}`}>
          <FaExpandAlt />
        </Link>
      </div>
    </div>
  );
};

export default ProductCard;

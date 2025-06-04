import { render, screen, fireEvent } from "@testing-library/react";
import { ProductCard } from "@/components/product-card";

const mockProduct = {
  id: "1",
  title: "Test Product",
  price: "99.99",
  compareAtPrice: "129.99",
  status: "ACTIVE",
  productType: "Skateboard",
  createdAt: "2024-01-15T10:30:00Z",
  image: "https://example.com/image.jpg",
  currencyCode: "EUR",
};

describe("ProductCard Component", () => {
  test("should render product information correctly", () => {
    render(<ProductCard product={mockProduct} />);

    expect(screen.getByText("Test Product")).toBeInTheDocument();
    // Usar expresión regular para encontrar el precio con formato europeo
    expect(screen.getByText(/99,99 €/)).toBeInTheDocument();
    expect(screen.getByText(/129,99 €/)).toBeInTheDocument();
    expect(screen.getByText("Skateboard")).toBeInTheDocument();
  });

  test("should show discount badge when compareAtPrice is higher", () => {
    render(<ProductCard product={mockProduct} />);

    const discountBadge = screen.getByText(/-23/i);
    expect(discountBadge).toBeInTheDocument();
  });

  test("should handle missing image gracefully", () => {
    const productWithoutImage = { ...mockProduct, image: null };
    render(<ProductCard product={productWithoutImage} />);

    // Buscar el SVG del paquete por clase CSS
    const packageIcon = screen.getByText((content, element) => {
      return (
        element?.tagName.toLowerCase() === "svg" &&
        element?.classList.contains("lucide-package")
      );
    });
    expect(packageIcon).toBeInTheDocument();
  });

  test("should show correct status badge", () => {
    render(<ProductCard product={mockProduct} />);

    const activeBadge = screen.getByText("Activo");
    expect(activeBadge).toBeInTheDocument();
  });

  test("should show draft status for draft products", () => {
    const draftProduct = { ...mockProduct, status: "DRAFT" };
    render(<ProductCard product={draftProduct} />);

    const draftBadge = screen.getByText("Borrador");
    expect(draftBadge).toBeInTheDocument();
  });

  test("should show hover effects", () => {
    render(<ProductCard product={mockProduct} />);

    const card = screen.getByRole("link");
    fireEvent.mouseEnter(card);

    const viewButton = screen.getByText("Ver detalles");
    expect(viewButton).toBeInTheDocument();
  });

  test("should navigate to product detail page", () => {
    render(<ProductCard product={mockProduct} />);

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/dashboard/products/1");
  });
});

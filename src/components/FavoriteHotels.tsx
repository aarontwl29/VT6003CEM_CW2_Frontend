import React, { useState, useEffect } from "react";
import { Card, Typography, message, Spin, Button, Image, Empty } from "antd";
import {
  HeartFilled,
  StarFilled,
  EnvironmentOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import {
  getFavorites,
  removeFavorite,
  type FavoriteHotel,
} from "../services/favsService";
import { isAuthenticated } from "../services/authService";

const { Title, Text } = Typography;

interface FavoriteHotelCardProps {
  hotel: FavoriteHotel;
  onRemove: (hotelId: number) => void;
}

const FavoriteHotelCard: React.FC<FavoriteHotelCardProps> = ({
  hotel,
  onRemove,
}) => {
  const navigate = useNavigate();
  const [removing, setRemoving] = useState(false);

  const handleRemoveFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click navigation

    setRemoving(true);
    try {
      await removeFavorite(hotel.id);
      message.success(`${hotel.name} removed from favorites!`);
      onRemove(hotel.id);
    } catch (error) {
      console.error("Error removing favorite:", error);
      message.error(
        error instanceof Error
          ? error.message
          : "Failed to remove favorite. Please try again."
      );
    } finally {
      setRemoving(false);
    }
  };

  const handleCardClick = () => {
    navigate(`/hotels/${hotel.id}`);
  };

  return (
    <div
      style={{
        width: "100%",
        marginBottom: 16,
        padding: "16px",
        border: "1px solid #e8e8e8",
        borderRadius: 8,
        backgroundColor: "#fff",
        cursor: "pointer",
        position: "relative",
        transition: "box-shadow 0.3s ease",
      }}
      onClick={handleCardClick}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {/* Remove from favorites button */}
      <Button
        type="text"
        danger
        icon={<HeartFilled />}
        onClick={handleRemoveFavorite}
        loading={removing}
        style={{
          position: "absolute",
          top: 12,
          right: 12,
          color: "#ff4d4f",
          fontSize: 16,
          padding: 4,
          height: 32,
          width: 32,
          minWidth: 32,
          borderRadius: "50%",
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          zIndex: 10,
        }}
        title="Remove from favorites"
      />

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          paddingRight: 50,
        }}
      >
        {/* Hotel Image - Left side */}
        <div
          style={{
            width: "120px",
            height: "80px",
            overflow: "hidden",
            borderRadius: 6,
            flexShrink: 0,
          }}
        >
          <Image
            alt={hotel.name}
            src={hotel.image_url}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
            fallback="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjgwIiB2aWV3Qm94PSIwIDAgMTIwIDgwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iODAiIGZpbGw9IiNmMGYwZjAiLz48dGV4dCB4PSI2MCIgeT0iNDAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIiBmb250LXNpemU9IjEyIiBmaWxsPSIjOTk5Ij5Ib3RlbCBJbWFnZTwvdGV4dD48L3N2Zz4="
            preview={false}
          />
        </div>

        {/* Hotel Content - Main area */}
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Left side - Hotel Info */}
          <div style={{ flex: 1 }}>
            <Title
              level={4}
              style={{
                margin: 0,
                fontSize: 18,
                lineHeight: 1.3,
                marginBottom: 6,
              }}
            >
              {hotel.name}
            </Title>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 4,
              }}
            >
              <EnvironmentOutlined style={{ color: "#1890ff", fontSize: 14 }} />
              <Text type="secondary" style={{ fontSize: 14 }}>
                {hotel.city}, {hotel.country}
              </Text>
            </div>

            {hotel.address && (
              <Text type="secondary" style={{ fontSize: 13, lineHeight: 1.3 }}>
                {hotel.address}
              </Text>
            )}
          </div>

          {/* Center - Rating */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              minWidth: "100px",
              marginLeft: 20,
            }}
          >
            {hotel.rating && (
              <>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    marginBottom: 2,
                  }}
                >
                  <StarFilled style={{ color: "#faad14", fontSize: 16 }} />
                  <Text strong style={{ fontSize: 16 }}>
                    {hotel.rating}/5
                  </Text>
                </div>
                {hotel.review_count && hotel.review_count > 0 && (
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    ({hotel.review_count} reviews)
                  </Text>
                )}
              </>
            )}
          </div>

          {/* Right side - Description */}
          <div style={{ maxWidth: "300px", marginLeft: 20 }}>
            {hotel.description && (
              <Text type="secondary" style={{ fontSize: 13, lineHeight: 1.4 }}>
                {hotel.description.length > 120
                  ? `${hotel.description.substring(0, 120)}...`
                  : hotel.description}
              </Text>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const FavoriteHotels: React.FC = () => {
  const [favorites, setFavorites] = useState<FavoriteHotel[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFavorites = async () => {
      // Check if user is authenticated
      if (!isAuthenticated()) {
        message.warning("Please log in to view your favorites.");
        navigate("/login");
        return;
      }

      setLoading(true);
      try {
        const favoriteHotels = await getFavorites();
        setFavorites(favoriteHotels);
      } catch (error) {
        console.error("Error fetching favorites:", error);
        message.error(
          error instanceof Error
            ? error.message
            : "Failed to load favorites. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [navigate]);

  const handleRemoveFavorite = (hotelId: number) => {
    setFavorites((prev) => prev.filter((hotel) => hotel.id !== hotelId));
  };

  if (loading) {
    return (
      <div style={{ padding: "24px", textAlign: "center" }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>
          <Text>Loading your favorite hotels...</Text>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "24px", maxWidth: "1400px", margin: "0 auto" }}>
      <Title
        level={2}
        style={{
          marginBottom: "24px",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <HeartFilled style={{ color: "#ff4d4f" }} />
        My Favorite Hotels
      </Title>

      {favorites.length === 0 ? (
        <Card>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <span>
                No favorite hotels yet
                <br />
                <Text type="secondary">
                  Start exploring and add hotels to your favorites by clicking
                  the heart icon!
                </Text>
              </span>
            }
          >
            <Button type="primary" onClick={() => navigate("/search-hotels")}>
              Explore Hotels
            </Button>
          </Empty>
        </Card>
      ) : (
        <>
          <Text type="secondary" style={{ marginBottom: 16, display: "block" }}>
            You have {favorites.length} favorite hotel
            {favorites.length > 1 ? "s" : ""}
          </Text>

          <div style={{ marginTop: 8 }}>
            {favorites.map((hotel) => (
              <FavoriteHotelCard
                key={hotel.id}
                hotel={hotel}
                onRemove={handleRemoveFavorite}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default FavoriteHotels;

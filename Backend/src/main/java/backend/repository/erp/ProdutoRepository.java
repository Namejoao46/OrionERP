package backend.repository.erp;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import backend.model.erp.Produto;

@Repository
public interface ProdutoRepository extends JpaRepository<Produto, Long> {

    Optional<Produto> findByCodigoBarras(String codigoBarras);

    boolean existsByCodigoBarras(String codigoBarras);

    List<Produto> findByStatus(String status);

    @Query("SELECT p FROM Produto p WHERE LOWER(p.descricao) LIKE LOWER(CONCAT('%', :termo, '%'))")
    List<Produto> buscarPorDescricao(@Param("termo") String termo);
}
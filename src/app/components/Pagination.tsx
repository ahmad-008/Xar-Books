import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";


interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

const pageList = (current: number, total: number) => {
    const pages = new Set([1, total, current - 1, current, current + 1]);
    const sorted = [...pages].filter((page) => page >= 1 && page <= total).sort((a, b) => a - b);
    return sorted.flatMap((page, i) => (i > 0 && page - sorted[i - 1] > 1 ? ["gap", page] : [page]));
};

const Pagination = ({ currentPage, totalPages, onPageChange }: PaginationProps) => {
    if (totalPages <= 1) return null;

    return (
        <nav aria-label="Pages" className="mt-8 flex flex-wrap items-center justify-center gap-2" >
            <Button
                variant="outline"
                size="icon"
                aria-label="Previous page"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
            >
                <ChevronLeft className="h-4 w-4" />
            </Button>

            {pageList(currentPage, totalPages).map((page, i) =>
                page === "gap" ? (
                    <span key={`gap-${i}`} className="px-1 text-muted-foreground">…</span>
                ) : (
                    <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        aria-current={currentPage === page ? "page" : undefined}
                        onClick={() => onPageChange(page as number)}
                    >
                        {page}
                    </Button>
                )
            )}

            <Button
                variant="outline"
                size="icon"
                aria-label="Next page"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
            >
                <ChevronRight className="h-4 w-4" />
            </Button>
        </nav>
    );
};

export default Pagination;
